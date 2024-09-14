import { sesClient } from "../config/ses";
import randomstring from "randomstring";
import { userRepository } from "../repositories/userRepository";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { generateVerificationEmail } from "../templates/verificationEmail";

class emailService {
  async sendVerificationEmail(userId: string) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw {
        status: 404,
        code: "USER_NOT_FOUND",
        message: "No user is associated with this ID.",
      };
    }

    const token = randomstring.generate();
    const expireAt = new Date().setMinutes(new Date().getMinutes() + 2);

    try {
      const emailToken = await userRepository.addEmailToken(
        userId,
        token,
        new Date(expireAt)
      );
    } catch {
      throw {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create email token.",
      };
    }

    try {
      await sesClient.send(
        new SendEmailCommand({
          Destination: {
            ToAddresses: [user.email],
          },
          Message: {
            Body: {
              Html: {
                Data: generateVerificationEmail(token),
              },
            },
            Subject: {
              Data: "Verify your account",
            },
          },
          Source: "no-reply@baddit.life",
        })
      );
    } catch {
      throw {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send verification email.",
      };
    }
  }
}

export default new emailService();
