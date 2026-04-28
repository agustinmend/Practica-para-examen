import { Message } from "./message";
export interface Channel {
    id: string;
    name: string;
    topic: string;
    unread: number;
    members: string[];
    messages: Message[];
}
