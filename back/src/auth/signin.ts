import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { OAuth2Client } from 'google-auth-library';

interface SignInBody {
  code: string;
}

interface GoogleOAuthConfigSecret {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const client = new SecretsManagerClient();
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: 'GoogleClientConfig',
      }),
    );
    if (!response.SecretString) {
      return {
        statusCode: 500,
        body: 'Google OAuth Config secret could not be retrieved',
      };
    }
    const googleOAuthConfig: GoogleOAuthConfigSecret = JSON.parse(response.SecretString);
    if (!googleOAuthConfig.GOOGLE_CLIENT_ID || !googleOAuthConfig.GOOGLE_CLIENT_SECRET) {
      return {
        statusCode: 500,
        body: 'Google OAuth Config secret could not be retrieved',
      };
    }
    const googleOAuthClient = new OAuth2Client(
      googleOAuthConfig.GOOGLE_CLIENT_ID,
      googleOAuthConfig.GOOGLE_CLIENT_SECRET,
      'postmessage',
    );
    const body: SignInBody = JSON.parse(event.body!);
    if (!body.code) {
      return {
        statusCode: 400,
        body: 'You must provide a code',
      };
    }
    const { tokens } = await googleOAuthClient.getToken(body.code);
    if (!tokens.id_token) {
      return {
        statusCode: 400,
        body: 'ID Token not present in Google OAuth response',
      };
    }
    const loginTicket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const userId = loginTicket.getUserId();
    const userInfo = loginTicket.getPayload();
    const currentUser = {
      id: userId,
      email: userInfo?.email,
      name: userInfo?.name,
      photoURL: userInfo?.picture,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(currentUser),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': 'https://www.raffle-hub.net',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
      multiValueHeaders: {
        'Set-Cookie': [
          `idToken=${tokens.id_token}; path=/; SameSite=Strict; Domain=.raffle-hub.net; Secure; max-age=604800; httponly`,
          `accessToken=${tokens.access_token}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `refreshToken=${tokens.refresh_token}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `expiryDate=${tokens.expiry_date}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `currentUserId=${userId}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `currentUserEmail=${userInfo?.email}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `currentUserName=${userInfo?.name}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
          `currentUserPicture=${userInfo?.picture}; SameSite=Strict; Domain=.raffle-hub.net; Secure; path=/; max-age=604800; httponly`,
        ],
      },
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
      headers: {
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
    };
  }
};
