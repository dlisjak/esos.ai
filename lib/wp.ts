import WPAPI from "wpapi";

declare global {
  var wp: WPAPI | undefined;
}

const wp = (endpoint: string, username: string, password: string) =>
  new WPAPI({ endpoint: `https://${endpoint}`, username, password });

export default wp;
