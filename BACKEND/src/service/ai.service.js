import {GoogleGenAI} from '@google/genai'


const ai = new GoogleGenAI({})


const generateResponse = async(prompt)=>{
    const response = await ai.models.generateContent({
        model:"gemini-2.0-flash",
        content:prompt
    })


    return response.text
}


export {
    generateResponse
}