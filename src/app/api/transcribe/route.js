import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GetTranscriptionJobCommand, StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import { resolve } from "styled-jsx/css";

function getClient(){
    return new TranscribeClient({
        region: 'ap-south-1',
        credentials:{
            accessKeyId:process.env.MYAWS_ACCESS_KEY,
            secretAccessKey:process.env.MYAWS_SECRET_ACCESS_KEY,
        },

    });

}

function createTranscription(filename){
    return new StartTranscriptionJobCommand({
        //will also get updates for jobs 
        TranscriptionJobName:filename,
        OutputBucketName:process.env.BUCKET_NAMEMY,
        OutputKey:filename+'.transcription',
        IdentifyLanguage:true,
        Media:{
            MediaFileUri:'s3://'+process.env.BUCKET_NAMEMY+'/'+filename,
        }
    });
}

async function createTranscriptionJob(filename){
    const transcribeClient = getClient();
     const transcriptionCommand = createTranscription(filename);

     return transcribeClient.send(transcriptionCommand);
    

}

async function getJob(filename) {
    const transcribeClient = getClient();

    let jobStatusResult=null;
    try{
        const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
        TranscriptionJobName:filename,
    });
    jobStatusResult = await transcribeClient.send(transcriptionJobStatusCommand);
    } catch(e){

    }
    return jobStatusResult;
    
}

async function streamtoString(stream) {
    const chunks = [];
    return new Promise((resolve,reject) =>{
        stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error',reject);
    });    
}

async function getTranscriptionFile(filename){
    const transcriptionFile = filename+'.transcription';

    const s3client = new S3Client({
            region: 'ap-south-1',
            credentials:{
                accessKeyId:process.env.MYAWS_ACCESS_KEY,
                secretAccessKey:process.env.MYAWS_SECRET_ACCESS_KEY,
    
            },
    });

    const getObjectCommand = new GetObjectCommand({
        Bucket:process.env.BUCKET_NAMEMY,
        Key:transcriptionFile,
    });

    let transcriptionFileResponse=null;
    try{
        transcriptionFileResponse = await s3client.send(getObjectCommand);
    } catch(e){

    }
    if(transcriptionFileResponse){
        return JSON.parse(await streamtoString(transcriptionFileResponse.Body));
        
        
    }
    return null;
}

export async function GET(req) {
    let result;
    const url = new URL(req.url);
    const searchParams= new URLSearchParams(url.searchParams);
    const filename = searchParams.get('filename');

    //find an already done transcription
    const transcription = await getTranscriptionFile(filename);
    if(transcription){
        return Response.json({
            status:'COMPLETED',
            transcription,
        });
    }
    
    //check if already transcribing

    const existingJob= await getJob(filename);

    //making new transcription job

    if(existingJob){
        return Response.json({
            status:existingJob.TranscriptionJob.TranscriptionJobStatus,
        });
    }

    if(!existingJob){
        const newJob = await createTranscriptionJob(filename);
        return Response.json({
            status:newJob.TranscriptionJob.TranscriptionJobStatus,
        });
    }

    return Response.json(null);
    
}
