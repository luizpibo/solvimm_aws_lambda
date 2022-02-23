"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import getImage from "./../getImage/index";

const TABLE = process.env.DYNAMODB_TABLE;

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.REGION || "sa-east-1",
});

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
      Key: { s3objectkey: s3objectkey },
    };

    let { Item } = await dynamoDb.get(params).promise();

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Not Found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ metadataImage: Item }),
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
