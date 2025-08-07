'use client';

import { useState } from "react";
import UploadIcon from "./UploadIcon";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function UploadForm(){

    const [isUploading, setIsUploading]=useState(false);

    const router = useRouter();

    async function upload(ev){
        ev.preventDefault();
        const files = ev.target?.files;
        if(files.length>0){
            const file=files[0];
            setIsUploading(true);
            const res= await axios.postForm('/api/upload',{
                file,
            });
            setIsUploading(false);
            const newName = res.data.newName;
            router.push('/'+newName);
        }
    }
    return(
        <>
        {isUploading && (
           <div className="bg-black/80 fixed inset-0 flex flex-col items-center justify-center z-50">
            <div className="bg-gray-900/95 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 border-4 border-[#9747FF] border-t-white rounded-full animate-spin mb-6"></div>
                <div className="text-white text-2xl font-semibold mb-2">Uploading your video...</div>
                <div className="text-gray-400 text-lg">Please wait while we process your file</div>
                <div className="mt-4 w-64 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#9747FF] to-purple-400 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
           </div>
          )}

        <label className="bg-green-600 py-2 px-6 
        rounded-full inline-flex gap-2 border-2 
        border-purple-700/50 cursor-pointer">
          <UploadIcon />

          <span>Choose File</span>
          <input onChange={upload} type="file" className="hidden"/>
          </label>
        </>
    );
}