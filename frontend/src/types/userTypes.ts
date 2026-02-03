import {AvatarData} from "./avatarTypes"

export interface UserData {
  _id?: string;
  email: string;
  password: string;
  avatar?: AvatarData;
}
