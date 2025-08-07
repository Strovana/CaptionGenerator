export function clearTranscriptionItems(items) {
  const cleanedItems = [];
  let lastMergedPunctuation = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || !item.alternatives || !item.alternatives[0]) continue;

    const currentContent = item.alternatives[0].content;

    if (!item.start_time) {
      // Merge punctuation into previous item
      if (cleanedItems.length > 0) {
        const prevItem = cleanedItems[cleanedItems.length - 1];
        prevItem.alternatives[0].content += currentContent;
        lastMergedPunctuation = true;
      }
    } else {
      if (cleanedItems.length > 0) {
        const prevItem = cleanedItems[cleanedItems.length - 1];
        // If we didn't just merge punctuation, add a space
        if (!lastMergedPunctuation) {
          prevItem.alternatives[0].content += ' ';
        }
        lastMergedPunctuation = false;
      }

      cleanedItems.push({ ...item }); // shallow copy to avoid mutation
    }
  }

  return cleanedItems.map(item => ({
    start_time: item.start_time,
    end_time: item.end_time,
    content: item.alternatives[0].content.replace(/\s+/g, ' ').trim()
  }));
}



export function transcriptionItemstoSrt(items) {
  let srt = '';
  let i = 1;
  const maxDuration = 3; // group subtitles every 3 seconds
  let group = [];
  let groupStart = null;
  let groupEnd = null;

  items.forEach((item, index) => {
    let start = parseFloat(item.start_time);
    let end = parseFloat(item.end_time);
    if (isNaN(start) || isNaN(end)) return;

    if (group.length === 0) {
      groupStart = start;
      groupEnd = end;
    }

    group.push(item.content);
    groupEnd = end;

    const next = items[index + 1];
    const nextStart = next ? parseFloat(next.start_time) : null;

    // Create a group when:
    // - next item is too far
    // - OR group duration is long enough
    if (
      nextStart === null ||
      nextStart - groupStart > maxDuration ||
      group.length >= 10
    ) {
      srt += `${i}\n`;
      srt += `${secondsToHHMMSSMS(groupStart)} --> ${secondsToHHMMSSMS(groupEnd)}\n`;
      srt += `${group.join(' ').replace(/\s+/g, ' ').trim()}\n\n`;
      group = [];
      groupStart = null;
      groupEnd = null;
      i++;
    }
  });

  return srt;
}

function secondsToHHMMSSMS(seconds) {
  const ms = Math.floor((seconds % 1) * 1000);
  const date = new Date(0);
  date.setSeconds(Math.floor(seconds));
  return date.toISOString().substr(11, 8) + ',' + ms.toString().padStart(3, '0');
}
