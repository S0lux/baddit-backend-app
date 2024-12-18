import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { APP_ERROR_CODE, HttpStatusCode } from "../constants/constant";
import { HttpException } from "../exception/httpError";
import { userRepository } from "../repositories/userRepository";
import { generateHash } from "../utils/hashFunctions";

class userService {
  async updateUserAvatar(id: string, avatarUrl: string) {
    try {
      await userRepository.updateAvatar(id, avatarUrl);
    } catch {
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
    }
  }

  async getUserById(id: string) {
    try {
      return await userRepository.getUserById(id);
    } catch {
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
    }
  }

  async getUserByUserName(username: string) {
    try {
      const userFound = await userRepository.getUserByUsername(username);
      if (userFound === null)
        throw new HttpException(HttpStatusCode.NOT_FOUND, APP_ERROR_CODE.userNotFound);
      else return userFound;
    } catch {
      throw new HttpException(HttpStatusCode.NOT_FOUND, APP_ERROR_CODE.userNotFound);
    }
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      await userRepository.updatePassword(userId, generateHash(newPassword));
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2016") {
          throw new HttpException(HttpStatusCode.NOT_FOUND, APP_ERROR_CODE.userNotFound);
        }
      }
      throw new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, APP_ERROR_CODE.serverError);
    }
  }
}

export default new userService();
