export interface JwtConfig {
  secret: string;
  audience: string;
  issuer: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
  fileDestination: string;
  cover: string;
  avatar: string;
}