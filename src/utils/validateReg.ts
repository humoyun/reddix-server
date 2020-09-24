import { UserInput } from "../types";

export const validateReg = (args: UserInput) => {
  if (
    !args.username ||
    args.username.includes("@") ||
    args.username.length < 4
  ) {
    return [
      {
        field: "username",
        message: "length should be greater than 4 and should not contain @ symbol",
      }
    ];
  }

  if (!args.email || !args.email.includes("@") || args.email.length < 4) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ]; 
  }

  if (!args.password || args.password.length < 4) {
    return [
      {
        field: "password",
        message: "length should be greater than 4",
      },
    ];
  }

  return null;
};