import { NextResponse } from "next/server"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb"

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
  })
)

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    const result = await dynamo.send(
      new GetCommand({
        TableName: "VideoAnalysis",
        Key: { videoId },
      })
    )

    if (!result.Item) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.Item)
  } catch (error) {
    console.error("Fetch video error:", error)
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    )
  }
}