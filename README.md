# Database Verbinding
## MySql2

De MySQL2 library is een npm module die het mogelijk maakt om verbinding te maken met een MySQL database. Deze maakt het mogelijk om queries te gaan uitvoeren vanuit node.js code. We werken dus niet meer rechstreeks met een client zoals MySQL Workbench of phpMyAdmin. We gaan de queries uitvoeren vanuit node.js code.

### Installatie

Om de MySQL2 module te installeren voeren we de volgende commando uit in de terminal:

```bash
npm install mysql2
```

### Database connectie

Om een verbinding te maken met een database maken we gebruik van de `createConnection` functie. Deze functie heeft als argumenten een object met de volgende properties:

  * `host`: De hostnaam van de database server. 
  * `user`: De gebruikers naam van de database. 
  * `password`: Het wachtwoord van de database.
  * `database`: De naam van de database.

We kiezen hier om gebruik te maken van de promise versie van de `mysql2` library. Dit doen we door te de `createConnection` functie te importeren vanuit de `mysql2/promise` module. Dit zorgt ervoor dat we gebruik kunnen maken van de `async/await` syntax.

```typescript
import mysql2 from 'mysql2/promise';
```

Omdat we hier willen gebruik maken van async/await moeten we de functie waar deze gebruikt wordt ook async maken. We maken hier een asynchrone functie aan met de naam `main` en roepen deze functie aan het einde van het bestand aan. Hier gaan we de database connectie maken.

```typescript
async function main() {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost',
            user: 'user',
            password: 'password',
            database: 'tutorial'});
        console.log("Connected!");
        connection.end();
    } catch (error) {
        console.log(error);
    }

}
main();
```

Merk hier op dat we de code in een `try/catch` blok zetten. Dit doen we omdat we hiermee de fouten kunnen opvangen die op kunnen treden. In het `catch` blok loggen we de error naar de console. Als je bijvoorbeeld geen verbinding kunt maken omdat je een foutieve gebruikersnaam of wachtwoord hebt ingevuld dan zal de error hier worden opgevangen.

Momenteel sluiten we direct de connectie na het maken van de connectie. Dit doen we omdat we nu nog geen queries uitvoeren. Als we queries uitvoeren dan willen we de connectie open houden totdat we klaar zijn met de queries. 

### Queries uitvoeren

Om queries uit te voeren maken we gebruik van het `connection` object dat we hebben aangemaakt. We maken hier gebruik van de `execute` functie waar we de query meegeven als argument. Deze functie geeft een array terug met twee elementen. Het eerste element is een array met de resultaten van de query. Het tweede element is een array met metadata over de query. We gaan hier alleen gebruik maken van het eerste element. 

#### Select met meerdere resultaten

Als je bijvoorbeeld een query uitvoeren om alle gebruikers van een `Users` tabel op te halen dan zou je de volgende code kunnen gebruiken:

```typescript
const [rows_users] = await connection.execute('SELECT * FROM `users`');

console.log(rows_users);
// [
//   { id: 1, name: 'Jon', email: 'john@example.com' },
//   { id: 2, name: 'Paul', email: 'paul@example.com' },
//   { id: 3, name: 'Mary', email: 'mary@example.com' }
// ]
```

Je krijgt hier een array terug met resultaten van de query. Dit object is van het type `RowDataPacket`. Wil je voor dit object autocomplete functionaliteit hebben en static typing dan moet je voor het resultaten object een interface aanmaken die `RowDataPacket` extend. 

```typescript
interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
}
```

Je gebruikt dan de Diamond Operator om aan te geven dat je een array wilt met objecten van het type `User`. Het resultaat zal dan het type `User[]` hebben.

```typescript
// Query all rows from the users table
const [rows_users] = await connection.execute<User[]>('SELECT * FROM `users`');

console.log(rows_users);
```

Wil je een specifieke gebruiker opvragen dan kun je een `WHERE` clause gebruiken. In dit voorbeeld gaan we de gebruiker opvragen met de id 1.

```typescript
const [rows_user] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = 1');
```

Ook al krijg je hier maar 1 rij terug zal het resultaat een array zijn. Dit komt omdat de `execute` functie altijd een array terug geeft. Je zal dus zelf de eerste rij uit de array moeten halen omdat hij niet op voorhand weet of je 1 of meerdere rijen terug krijgt.

```typescript
const [rows_user] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = 1');
const user = rows_user[0];
```

#### Prepared statements

Als je een query uitvoert met een `WHERE` clause dan is het mogelijk dat je een SQL injection aanval krijgt. Dit is een aanval waarbij een gebruiker een query kan uitvoeren die niet de bedoeling is. Om dit te voorkomen kun je gebruik maken van prepared statements. Dit zijn statements waarbij je de variabelen in de query vervangt door een placeholder. Deze placeholders worden vervolgens vervangen door de variabelen die je meegeeft aan de `execute` functie. 

```typescript
const [rows_user] = await connection.execute<User[]>('SELECT * FROM `users` WHERE `id` = ?', [1]);
```

In dit voorbeeld hebben we de `id` variabele vervangen door een `?` placeholder. Deze placeholder wordt vervangen door de eerste variabele in de array die we meegeven aan de `execute` functie. Gebruik je meerdere placeholders dan moet je meerdere variabelen meegeven aan de `execute` functie.

Gebruik altijd prepared statements als je een `WHERE` clause gebruikt. Dit voorkomt SQL injection aanvallen.

#### Insert

Als je een insert query wilt uitvoeren dan kun je de `execute` functie ook gebruiken. Je moet dan wel de `INSERT` query gebruiken. 

```typescript
const [result] = await connection.execute<OkPacket>('INSERT INTO `users` (`name`, `email`) VALUES (?, ?)', ['Andie Similon', 'andie.similon@ap.be']);
console.log(result.insertId);
```

De `result` variabele is van het type `OkPacket`. Dit is een object dat de metadata van de query bevat. In dit geval bevat het object de `insertId` van de nieuwe rij. Je weet dan welke id de nieuwe rij heeft gekregen.

#### Update

Op dezelfde manier kun je ook een update query uitvoeren. 

```typescript
const [result_update] = await connection.execute<OkPacket>('UPDATE `users` SET `name` = ? WHERE `id` = ?', ['Jon', 1]);
console.log(result_update.affectedRows);
```

Om te zien hoeveel rijen zijn aangepast kun je de `affectedRows` property gebruiken.

#### Delete

Een delete query werkt op dezelfde manier als een update query. Willen we bijvoorbeeld de gebruiker met de id 1 verwijderen dan kunnen we de volgende code gebruiken.

```typescript
const [result_delete] = await connection.execute<OkPacket>('DELETE FROM `users` WHERE `id` = ?', [1]);
console.log(result_delete.affectedRows);
```

#### Stored procedures

Als je een stored procedure wilt uitvoeren dan kun je de `execute` functie ook gebruiken. Je moet dan wel de `CALL` query gebruiken. Wil je hiervoor geen interface voor aanmaken kan je ook altijd de `RowDataPacket` gebruiken. Dit werkt ook voor andere queries.

```typescript
const [rows_likes] = await connection.execute<RowDataPacket[]>('CALL get_likes_for_post(?)', [1]);
console.log(rows_likes[0].likes);
```

## Express

We kunnen met de kennis die we nu hebben van de mysql2 en de express library nu een API gaan bouwen. We gaan een API maken die gebruikers kan aanmaken, posts kan aanmaken en likes kan geven aan posts.

```typescript
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/users', async (req, res) => {
  
  
});

app.listen(port, async() => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

## SQL Script

Het SQL init script dat voor de code hierboven hebben gebruikt is als volgt:

```sql
CREATE DATABASE IF NOT EXISTS tutorial;
USE tutorial;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS posts (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS likes (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

DELIMITER $$
CREATE PROCEDURE get_likes_for_post(IN post_id INT)
BEGIN
  SELECT COUNT(*) AS likes FROM likes WHERE post_id = post_id;
END$$
DELIMITER ;

INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
INSERT INTO users (name, email) VALUES ('Paul', 'paul@example.com');
INSERT INTO users (name, email) VALUES ('Mary', 'mary@example.com');

INSERT INTO posts (title, body, user_id) VALUES ('John\'s Post', 'This is John\'s post', 1);
INSERT INTO posts (title, body, user_id) VALUES ('Paul\'s Post', 'This is Paul\'s post', 2);
INSERT INTO posts (title, body, user_id) VALUES ('Mary\'s Post', 'This is Mary\'s post', 3);
INSERT INTO posts (title, body, user_id) VALUES ('John\'s Second Post', 'This is John\'s second post', 1);

INSERT INTO likes (post_id, user_id) VALUES (1, 2);
INSERT INTO likes (post_id, user_id) VALUES (2, 1);
INSERT INTO likes (post_id, user_id) VALUES (3, 2);
INSERT INTO likes (post_id, user_id) VALUES (4, 3);
```

