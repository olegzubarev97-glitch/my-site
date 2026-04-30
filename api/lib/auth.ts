import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "../kimi/session";
import { findUserByUnionId } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    return undefined;
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    return undefined;
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    return undefined;
  }
  return user;
}
