"use strict";

import { S3Event, S3Handler } from "aws-lambda";
import { DynamoDB, S3 } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.REGION || "sa-east-1",
}); // dynamoDb client

const TABLE_NAME = (process.env.DYNAMODB_TABLE as string) || "sa-east-1"; // DynamoDB table name

function getExtension(path) {
  var r = /\.([^./]+)$/.exec(path);
  return (r && r[1]) || "";
}

const extractMetadata: S3Handler = async (event: S3Event) => {
  try {
    const s3 = new S3();
    await Promise.all(
      event.Records.map(async (record) => {
        const Bucket = record.s3.bucket.name; // s3 bucket name
        const key = record.s3.object.key; // s3 object key

        const ImageSize = record.s3.object.size; //file size in bytes

        const params = {
          Bucket,
          Key: key,
        };

        const image = await s3.getObject(params).promise();
        const imageType = image.ContentType;

        const item = {
          s3objectkey: key,
          ContentType: getExtension(key),
          size: ImageSize,
        };

        await dynamoDb
          .put({
            TableName: TABLE_NAME,
            Item: item,
          })
          .promise();
      })
    );
  } catch (err) {
    throw err;
  }
};

export default extractMetadata;
