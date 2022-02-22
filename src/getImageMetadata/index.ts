"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
const dynamoDb = new DynamoDB.DocumentClient();
const TABLE = process.env.DYNAMODB_TABLE;

const getImageMetadata: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
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
      TableName: process.env.DYNAMODB_TABLE as string,
      Key: s3objectkey,
    };

    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(params),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

export default getImageMetadata;
