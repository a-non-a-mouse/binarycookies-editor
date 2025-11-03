/*
| Field              | Endianness | Type         | Size | Description                                                             |
| ------------------ | ---------- | ------------ | ---- | ----------------------------------------------------------------------- |
| Size               | LE         | Unsigned Int | 4    | Size in bytes                                                           |
| Version            | LE         | Unsigned Int | 4    | 0 or 1                                                                  |
| Flags              | LE         | Bit field    | 4    | isSecure = 1, isHTTPOnly = 1 << 2, unknown1 = 1 << 3, unknown2 = 1 << 4 |
| Has port           | LE         | Unsigned Int | 4    | 0 or 1                                                                  |
| URL Offset         | LE         | Unsigned Int | 4    | Offset from the start of the cookie                                     |
| Name Offset        | LE         | Unsigned Int | 4    | Offset from the start of the cookie                                     |
| Path Offset        | LE         | Unsigned Int | 4    | Offset from the start of the cookie                                     |
| Value Offset       | LE         | Unsigned Int | 4    | Offset from the start of the cookie                                     |
| Comment Offset     | LE         | Unsigned Int | 4    | Offset from the start of the cookie, 0x00000000 if not present          |
| Comment URL Offset | LE         | Unsigned Int | 4    | Offset from the start of the cookie, 0x00000000 if not present          |
| Expiration         | LE         | Double       | 8    | Number of seconds since 00:00:00 UTC on 1 January 2001                  |
| Creation           | LE         | Double       | 8    | Number of seconds since 00:00:00 UTC on 1 January 2001                  |
| Port               | LE         | Unsigned Int | 2    | Only present if the "Has port" field is 1                               |
| Comment            | LE         | String       |      | Null-terminated, optional                                               |
| Comment URL        | LE         | String       |      | Null-terminated, optional                                               |
| URL                | LE         | String       |      | Null-terminated                                                         |
| Name               | LE         | String       |      | Null-terminated                                                         |
| Path               | LE         | String       |      | Null-terminated                                                         |
| Value              | LE         | String       |      | Null-terminated                                                         |
*/
export type Cookie = {
  version: number;
  flags: number;
  hasPort: boolean;
  urlOffset: number;
  nameOffset: number;
  pathOffset: number;
  valueOffset: number;
  commentOffset?: number;
  commentURLOffset?: number;
  expiration: number;
  creation: number;
  port: number | undefined;
  comment: string | undefined;
  commentURL: string | undefined;
  url: string;
  name: string;
  path: string;
  value: string;
};

export type BinaryCookies = {
  cookies: Cookie[];
  metadata: string;
};
