"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { S3 } from "aws-sdk";

const getImage: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const s3 = new S3();

    if (!event.pathParameters || !event.pathParameters.s3objectkey) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          error: "Bad Request",
        }),
      };
    }

    const s3objectkey = event.pathParameters.s3objectkey;

    const params = {
      Bucket: process.env.BUCKET as string,
      Key: s3objectkey as string,
    };

    const image = await s3.getObject(params).promise();
    return {
      statusCode: 200,
      headers: {
        "content-type": image.ContentType,
      },
      body: "aaa",
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

export default getImage;
