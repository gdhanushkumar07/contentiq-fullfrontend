import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from "uuid"
import { s3 } from "@/lib/aws"

export const runtime = "nodejs"
export const maxDuration = 60

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION })
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const videoId = uuidv4()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const key = `uploads/${videoId}.mp4`

    // 1️⃣ Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    // 2️⃣ Insert into DynamoDB
    await dynamo.send(
      new PutCommand({
        TableName: "VideoAnalysis",
        Item: {
          videoId,
          s3Key: key,
          status: "uploaded",
          createdAt: new Date().toISOString(),
        },
      })
    )
    console.log("DynamoDB record inserted:", videoId)

    return NextResponse.json({
      success: true,
      videoId,
    })
  } catch (err) {
    console.error("UPLOAD ERROR:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}