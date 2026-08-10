import asyncio
import httpx

async def send_req(client):
    response = await client.post(
        "http://localhost:8000/api/chat",
        json={"text": "Apple is a tech company founded by Steve Jobs."}
    )
    print(response.status_code, response.text)

async def main():
    # First reset DB to ensure clean state
    async with httpx.AsyncClient(timeout=30.0) as client:
        await client.post("http://localhost:8000/api/reset")
        
        # Send 2 concurrent requests
        await asyncio.gather(
            send_req(client),
            send_req(client)
        )

if __name__ == "__main__":
    asyncio.run(main())
