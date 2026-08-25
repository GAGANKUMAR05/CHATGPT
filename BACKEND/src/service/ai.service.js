import {GoogleGenAI} from '@google/genai'


const ai = new GoogleGenAI({})


const generateResponse = async(prompt)=>{
    const response = await ai.models.generateContent({
        model:"gemini-2.0-flash",
        content:prompt
    })


    return response.text
}

async function generateVector(content){
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents : content,
        config:{
            outputDimensionality:768
        }
    })

    return response.embeddings
}

export {
    generateResponse,
    generateVector
}