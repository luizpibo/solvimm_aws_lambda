"use strict";

import { S3Event, S3Handler } from "aws-lambda";
import { DynamoDB, S3 } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const BUKET = process.env.BUCKET_NAME;
const TABLE = process.env.DYNAMODB_TABLE;

const extractMetadata: S3Handler = async (event: S3Event) => {
  try {
    const s3 = new S3();
    await Promise.all(
      event.Records.map(async (record) => {
        const Bucket = record.s3.bucket.name;
        const key = record.s3.object.key;

        const ImageSize = record.s3.object.size;

        const params = {
          Bucket,
          Key: key,
        };

        const image = await s3.getObject(params).promise();
        const imageType = image.ContentType;

        const item = {
          id: key,
          ContentType: imageType,
          size: ImageSize,
        };

        console.log("item - ", item);
        dynamoDb.put({
          TableName: process.env.DYNAMODB_TABLE as string,
          Item: item,
        });
      })
    );
  } catch (err) {
    throw err;
  }
};

export default extractMetadata;
