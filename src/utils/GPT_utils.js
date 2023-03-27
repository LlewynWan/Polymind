import { Configuration, OpenAIApi } from "openai"

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.REACT_APP_OPENAI_API_KEY })
)

const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

export async function promptGPT(prompt, num_results, max_words_per_result, handleResponse) {
  const GPT35TurboMessage = [ 
    { role: "system", content: `You are a writing expert and you are assisting users in prewriting process. You should strictly follow the output specification given by the user.` },
    {   
      role: "user",
      content: prompt + `\n\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`,
    },
  ];

  // console.log(prompt)
  // console.log(prompt + `\n\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`)

  const requestOptions = {
    // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      'messages': GPT35TurboMessage,
      'temperature': 0.7,
      // 'max_tokens': maxTokens,
      // 'top_p': 1,
    //   'frequency_penalty': 0,
    //   'presence_penalty': 0.5,
    //   'stop': ["\"\"\""],
    })
  };
  fetchTimeout('https://api.openai.com/v1/chat/completions', 7500, requestOptions)
      .then(response => response.json())
      .then(data => {
        if (num_results > 1) {
          return data.choices[0].message.content.split('\n')
        } else {
          return [data.choices[0].message.content];
        }
      })
      .then(results => results.map(result =>
        result.trim().replace(/^[0-9]+\. /, "").replace(/[^a-zA-Z ]/g, "")))
      .then(results => handleResponse(results))
    .catch(err => {
      handleResponse([]);
      console.log("Request Timeout");
      // console.log("Ran out of tokens for today! Try tomorrow!");
    });
}

export async function regenerate(prevPrompt, prevOutput, prompt, handleResponse) {
  const GPT35TurboMessage = [
    { role: "system", content: `You are a writing expert and you are assisting users in prewriting process. You should strictly follow the output specification given by the user.` },
    {   
      role: "user",
      content: prevPrompt,
    },
    {
      role: "assistant",
      content: prevOutput,
    },
    {
      role: "user",
      content: "Replace the output with a new one. " + prompt +
      "\n\n The output should be only one item with similar word count to the previous output."
    }
  ];

  const requestOptions = {
    // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      'messages': GPT35TurboMessage,
      'temperature': 0.7,
      // 'max_tokens': maxTokens,
      // 'top_p': 1,
    //   'frequency_penalty': 0,
    //   'presence_penalty': 0.5,
    //   'stop': ["\"\"\""],
    })
  };
  fetch('https://api.openai.com/v1/chat/completions', requestOptions)
      .then(response => response.json())
      .then(data => data.choices[0].message.content)
      .then(result => handleResponse(result))
    .catch(err => {
      console.log("Ran out of tokens for today! Try tomorrow!");
    });
}

export async function explain(prevPrompt, prevOutput, handleResponse) {
  const GPT35TurboMessage = [
    { role: "system", content: `You are a writing expert and you are assisting users in prewriting process. You should strictly follow the output specification given by the user.` },
    {   
      role: "user",
      content: prevPrompt,
    },
    {
      role: "assistant",
      content: prevOutput,
    },
    {
      role: "user",
      content: "Needs some simple explanation of the answer. The explanation output should be no more than 50 words"
    }
  ];

  // console.log(GPT35TurboMessage)

  const requestOptions = {
    // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      'messages': GPT35TurboMessage,
      'temperature': 0.7,
      // 'max_tokens': maxTokens,
      // 'top_p': 1,
    //   'frequency_penalty': 0,
    //   'presence_penalty': 0.5,
    //   'stop': ["\"\"\""],
    })
  };
  fetch('https://api.openai.com/v1/chat/completions', requestOptions)
      .then(response => response.json())
      .then(data => data.choices[0].message.content)
      .then(result => handleResponse(result))
    .catch(err => {
      console.log("Ran out of tokens for today! Try tomorrow!");
    });
}

export async function summarize(prevPrompt, prevOutput, handleResponse) {
  const GPT35TurboMessage = [
    { role: "system", content: `You are a writing expert and you are assisting users in prewriting process. You should strictly follow the output specification given by the user.` },
    {   
      role: "user",
      content: prevPrompt,
    },
    {
      role: "assistant",
      content: prevOutput,
    },
    {
      role: "user",
      content: "Summarise the answer in 10 words."
    }
  ];

  // console.log(GPT35TurboMessage)

  const requestOptions = {
    // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      'messages': GPT35TurboMessage,
      'temperature': 0.7,
      // 'max_tokens': maxTokens,
      // 'top_p': 1,
    //   'frequency_penalty': 0,
    //   'presence_penalty': 0.5,
    //   'stop': ["\"\"\""],
    })
  };
  fetchTimeout('https://api.openai.com/v1/chat/completions', 2000, requestOptions)
      .then(response => response.json())
      .then(data => data.choices[0].message.content)
      .then(result => handleResponse(result))
    .catch(err => {
      handleResponse("")
      console.log("Request Timeout");
    });
}

export async function requestTaskPrompt(taskName, handleResponse) {
  // var template = {example1: "{Task Name: Brainstorm, Example Prompt: ['Brainstorm keywords related to [placeholder].','Find synonyms for [placeholder].']}",
  // example2: "{Task Name: Summarise, Example Prompt: ['Provide a TLDR version of the following:\n[placeholder]','Summarise Top 3 keywords of the following:\n[placeholder]','Write an abstract of the following:\n[placeholder]']}",
  // example3: "{Task Name: Elaborate, Example Prompt: ['What are examples of [placeholder].', 'Provide a simple explanation of [placeholder]']",
  // example4: "{Task Name: Draft, Example Prompt: ['[placeholder].\n\nWrite an abstract of the above outline.']}"}
  // template = JSON.stringify(template);

  const GPT35TurboMessage = [
    { role: "system", content: `The user is microtasking while prewriting. Given a task name he would like to see a prompt example to communicate with ChatGPT.` },
    {role: "user",
    content: `Given a task name, write an example prompt to communicate with you. Below are some examples:\n\
    Task Name: Brainstorm\nPrompt: Brainstorm keywords related to [placeholder].\n\n\
    Task Name: Summarise\nPrompt: Provide a TLDR version of the following:\\n[placeholder].\n\n\
    Task Name: Elaborate\nPrompt: Provide a simple explanation of [placeholder].\n\n\
    Task Name: Draft\nPrompt: [placeholder].\\n\nWrite an abstract of the above outline.\n\n\
    Task Name: Freewrite\nPrompt: [placeholder].\\n Continue to write.\n\n\
    Now I'm going to give a task name, you should return a prompt. The output should be within 20 words.\n\
    Task Name: ${taskName}\n\
    Prompt: `}
  ];

  // console.log(GPT35TurboMessage)

  const requestOptions = {
    // mode: 'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      'messages': GPT35TurboMessage,
      'temperature': 0.7,
      // 'max_tokens': maxTokens,
      // 'top_p': 1,
    //   'frequency_penalty': 0,
    //   'presence_penalty': 0.5,
    //   'stop': ["\"\"\""],
    })
  };
  fetch('https://api.openai.com/v1/chat/completions', requestOptions)
      .then(response => response.json())
      .then(data => data.choices[0].message.content)
      .then(result => handleResponse(result))
    .catch(err => {
      console.log("Ran out of tokens for today! Try tomorrow!");
    });
}

// const GPT35TurboMessage = [ 
//   { role: "system", content: `You are a writing expert and you're assisting user for pre-writing.` },
//   {   
//     role: "user",
//     content: prompt + `\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`,
//   },
// ];

// // console.log(prompt + `\nThe output should be a list of ${num_results} items separated by a new line. Each item in the list should be no more than ${max_words_per_result} words`)

// let GPT35Turbo = async (message) => {
//   const response = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: message,
//   }); 
  
//   return response.data.choices[0].message.content;
// };

// let results = (await GPT35Turbo(GPT35TurboMessage)).split("\n");
// // trim each space and remove the digital number and non-alphabetical characters
// results = results.map((result) => {
//   return result.trim().replace(/^[0-9]+\. /, "").replace(/[^a-zA-Z ]/g, "");
// });
// return  results;

// const res = await promptGPT(1,1,1);
// console.log(res)

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