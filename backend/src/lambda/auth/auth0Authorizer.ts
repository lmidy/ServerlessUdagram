import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from 'middy'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJamWFPbGNsDzjMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi11d2JtNDcwYy51cy5hdXRoMC5jb20wHhcNMjAwOTE4MjExNDE2WhcN
MzQwNTI4MjExNDE2WjAkMSIwIAYDVQQDExlkZXYtdXdibTQ3MGMudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4wY4IZbFJPfFlkMu
xy9D7CSZ1Pfd1ZJAlHmtKV4QknyMAOQiOTlpatjXMvpJ2IXI165/+KrwPUlgPsvb
p5Sds9OL3iNEX2VvNF7c5gP7ZKbwoC+D4KBcMJsfl6GjpQBeW9cZ20j98HexgT40
tBKR2+aAId8ghQj6jRmlxFHhxNRb+Z31QOojpjhWEk3svDCociWEg2F2ebGxpljp
4/qPgFYxAPebEXHKkV7qK5m7vTAL90qcmVEWAQ//jfGddtD5N0TTQPBkLwJ6z1N4
gj7WfCxEFZ2EEVlpNQfbbzeMtiuTaosTBgjHwqcowj/iInK4N6F4oWFf6OdkIX0q
ITo5AwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSvGJMfFXx6
RpsxJdKCS/AIOhVHbTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ABRLWhaFTyVfRDNaPBCskiauQ7hOxUlFW3ETpR2ppi1ptM5Ep3625DS1UQ2blgXv
Q4R/B2/byfBys6mLAECeAjq8FENrCTs82rkWdJFJfPxZKzVb/TJijGq8xhlE+QIy
9l0p8LRlf7V1eSpb2J8ZAhni451VMzdx0CkoyXzzOLeUnQXWq+625UK7SPBrNRO2
LHqIjVIs6ue2AA4WyQwkFK/M6r5cBa3yCDnlVSGzYhXR/EmtN8RndLNCy7W3RYH+
RWcA84gUM1Rf6092II3lBZrex8h8VVxXCSzvBO5rHGwJK7j+fToBQkbWpUlM9f18
erHwm9AciTHD0lWoaj3ycdk=
-----END CERTIFICATE-----`

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-uwbm470c.us.auth0.com/.well-known/jwks.json'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

// const authSecret = process.env.AUTH_0_SECRET

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}