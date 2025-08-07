import TranscriptionItem from "./TranscriptionItem";

export default function TranscriptionEditor({awsTranscriptionItem, setAwsTranscriptionItems}) {
    
    function updateTranscriptionItem(index, prop, ev){
    const newAWSItems=[...awsTranscriptionItem];
    newAWSItems[index][prop]=ev.target.value;
    setAwsTranscriptionItems(newAWSItems);
  }
    
    return(
        <>
             <div className="grid grid-cols-3 sticky top-0 bg-violet-800/80 p-2 rounded-md">
            <div>From</div>
            <div>End</div>
            <div>Content</div>
          </div>
          {awsTranscriptionItem.length > 0 && (
            <div className="h-64 sm:h-auto overflow-y-scroll sm:overflow-auto">
              {awsTranscriptionItem.map((item, key) => (
            <div key={key}>
              <TranscriptionItem
              handleStartTimeChange={(ev) => updateTranscriptionItem(key, 'start_time', ev)}
              handleEndTimeChange={(ev) => updateTranscriptionItem(key, 'end_time', ev)}
              handleContentChange={(ev) => updateTranscriptionItem(key, 'content', ev)}
             // key={`${item.start_time ?? "no-time"}-${index}`}
              item={item}
            />
            </div>
          ))}
            </div>
          )}
        </>

    );
}