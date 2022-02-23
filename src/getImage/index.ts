"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { S3 } from "aws-sdk";

const BUCKET_NAME =
  (process.env.BUCKET_NAME as string) || "instagrao-s3-file-bucket-dev";

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
      Bucket: BUCKET_NAME,
      Key: s3objectkey as string,
    };
    console.log("params-getimage: ", params);
    const image = s3.getSignedUrl("getObject", params);
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ url: image }),
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
