import { Configuration, OpenAIApi } from "openai"

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.REACT_APP_OPENAI_API_KEY })
)

export async function promptGPT(prompt, num_results, max_words_per_result) {
  const GPT35TurboMessage = [ 
    { role: "system", content: `You are a writing expert and you're assisting user for pre-writing.` },
    {   
      role: "user",
      content: prompt + `\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`,
    },
  ];

  console.log(prompt + `\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`)

  let GPT35Turbo = async (message) => {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: message,
    }); 
    
    return response.data.choices[0].message.content;
  };

  let results = (await GPT35Turbo(GPT35TurboMessage)).split("\n");
  // trim each space and remove the digital number and non-alphabetical characters
  results = results.map((result) => {
    return result.trim().replace(/^[0-9]+\. /, "").replace(/[^a-zA-Z ]/g, "");
  });
  return  results;
}

// export async function PromptGPT(prompt, maxTokens, handleResponse)
// {
//     const requestOptions = {
//         // mode: 'no-cors',
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
//         },
//         body: JSON.stringify({
//           'prompt': prompt,
//           'temperature': 0.1,
//           'max_tokens': maxTokens,
//           'top_p': 1,
//         //   'frequency_penalty': 0,
//         //   'presence_penalty': 0.5,
//         //   'stop': ["\"\"\""],
//         })
//       };
//       fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', requestOptions)
//           .then(response => response.json())
//           .then(data => {
//             handleResponse(data.choices[0].text)
//         }).catch(err => {
//           console.log("Ran out of tokens for today! Try tomorrow!");
//         });
// }

// async function Brainstorming(keyword, num_keywords)
// {
//   const task = `List ${num_keywords} keywords is related to the ${keyword} in item, without any other dialogue.`;

//   const GPT35TurboMessage = [
//     { role: "system", content: `You are a writing expert and you're assisting user for pre-writing.` },
//     {
//       role: "user",
//       content: `I want to do the brainstorming for my essay. Here is a keyword: ${keyword}.`,
//     },
    
//     { role: "user", content: task },
//   ];
    
//     let GPT35Turbo = async (message) => {
//       const response = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: message,
//       }); 
      
//       return response.data.choices[0].message.content;
//     };
//     let keywordsList = (await GPT35Turbo(GPT35TurboMessage)).split("\n");
//     // trim each space and remove the digital number and non-alphabetical characters
//     keywordsList = keywordsList.map((keyword) => {
//       return keyword.trim().replace(/^[0-9]+\. /, "").replace(/[^a-zA-Z ]/g, "");
//     });
//     return  keywordsList;
// }


// async function Summarization(text, num_keywords)
// {
//   const task = `List Top-${num_keywords} related keywords in item, which is summarized from above text, without any other dialogue.`;

//   const GPT35TurboMessage = [ 
//     { role: "system", content: `You are a writing expert and you're assisting user for pre-writing.` },
//     {   
//       role: "user",
//       content: `I want to do the summarization for my essay. Here is a piece of text: ${text}.`,
//     },

//     { role: "user", content: task },
//   ];

//     let GPT35Turbo = async (message) => {
//       const response = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: message,
//       });

//       return response.data.choices[0].message.content;
//     };
//     let keywordsList = (await GPT35Turbo(GPT35TurboMessage)).split("\n");
//     keywordsList = keywordsList.map((keyword) => {
//       return keyword.trim().replace(/^[0-9]+\. /, "").replace(/[^a-zA-Z ]/g, "");
//     });
//     return keywordsList;
// }

