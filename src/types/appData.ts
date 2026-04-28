import { CurrentUser } from "./currentUser";
import { Workspace } from "./workspace";
import { Channel } from "./channel";
import { User } from "./user";
export interface AppData {
    currentUser: CurrentUser | null;
    workspaces: Workspace;
    channels: Channel[];
    users: User[];
}