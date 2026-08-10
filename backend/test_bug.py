import asyncio

import httpx


async def main():
    async with httpx.AsyncClient(timeout=60.0) as client:
        # TEST 1
        print("Running TEST 1...")
        res = await client.post(
            "http://localhost:8000/api/chat",
            json={
                "text": "Who were the key figures in World War 2? Mention Churchill, Roosevelt, and the Allied Powers."
            },
        )
        print(res.status_code, res.text)

        # TEST 2
        print("Running TEST 2...")
        res = await client.post(
            "http://localhost:8000/api/chat",
            json={"text": "Apple is a tech company founded by Steve Jobs."}
        )
        print(res.status_code, res.text)

        # TEST 3
        print("Running TEST 3...")
        res = await client.post(
            "http://localhost:8000/api/chat", json={"text": "AWS was created by Amazon in 2006."}
        )
        print(res.status_code, res.text)


if __name__ == "__main__":
    asyncio.run(main())
