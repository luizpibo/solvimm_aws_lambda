"use strict";

import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.REGION || "sa-east-1",
});

const tableName = process.env.DYNAMODB_TABLE as string;

const getInfoImages: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: tableName,
    };

    let response = await dynamoDb.scan(params).promise();
    const qtdeItens = response.Count;
    const { Items } = response;
    if (!Items?.length || qtdeItens === 0) {
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
      body: JSON.stringify({
        quantidadeItens: qtdeItens,
        itemComMaiorSize:
          Math.max.apply(
            null,
            Items.map((item) => {
              return item.size;
            })
          ) + " - bytes",
        itemComMenorSize:
          Math.min.apply(
            null,
            Items.map((item) => {
              return item.size;
            })
          ) + " - bytes",
        quantidadeTiposDeImagem: Items.reduce((acc, item) => {
          return {
            ...acc,
            [item.ContentType]: (acc[item.ContentType] || 0) + 1,
          };
        }, {}),
      }),
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

export default getInfoImages;
