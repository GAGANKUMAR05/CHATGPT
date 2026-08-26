import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortChatGptIndex =  pc.Idext('cohort-chat-gpt');

async function createMemory({vectors,metadata,messageId}){
    await cohortChatGptIndex.upsert([{
        id: messageId,
        values:vectors,
        metadata
    }])
}

async function queryMemory({queryVector,limit=5,metadata}){
    const data  = await cohortChatGptIndex.query({
        vector:queryVector,
        topK:limit,
        filter: metadata ? metadata : undefined,
        includeMetadata:true
    })

    return data.matches
}

export {
    createMemory,
    queryMemory
}