import type { Cipher, Decipher } from 'node:crypto';
import crypto from 'node:crypto';
import jwt from '@elysiajs/jwt';

// export const aes256Decrypt = <
//   T extends string | Record<string, any> | Record<string, any>[],
// >(
//   encrypted: string,
//   key: string,
//   iv: string,
// ): T => {
//   const buff: Buffer = Buffer.from(encrypted, "base64");
//   const decipher: Decipher = crypto.createDecipheriv(
//     config.jwtEncryptMethod,
//     key,
//     iv,
//   );
//   return JSON.parse(
//     decipher.update(buff.toString("utf8"), "hex", "utf8") +
//     decipher.final("utf8"),
//   );
// };

// export const verifyAccessToken = (token: string) => {
//   let decryptedToken: string = token;
//   if (config.enbTokenEncrypt) {
//     decryptedToken = aes256Decrypt(
//       token,
//       ,
//       config.jwtPayloadAccessTokenEncryptIv,
//     );
//   }
//   return jwt.verify(
//     decryptedToken,
//     config.jwtAccessTokenSecretKey,
//   ) as IJwtPayload;
// };
