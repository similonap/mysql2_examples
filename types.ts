import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    id?: number;
    name: string;
    email: string;
}

export interface Post extends RowDataPacket {
    id?: number;
    title: string;
    content: string;
    user_id: number;
}

export interface Like extends RowDataPacket {
    id?: number;
    user_id: number;
    post_id: number;
}