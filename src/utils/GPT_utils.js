import { Configuration, OpenAIApi } from "openai"

export async function PromptGPT(prompt, maxTokens, handleResponse)
{
    const requestOptions = {
        // mode: 'no-cors',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY)
        },
        body: JSON.stringify({
          'prompt': prompt,
          'temperature': 0.1,
          'max_tokens': maxTokens,
          'top_p': 1,
        //   'frequency_penalty': 0,
        //   'presence_penalty': 0.5,
        //   'stop': ["\"\"\""],
        })
      };
      fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', requestOptions)
          .then(response => response.json())
          .then(data => {
            handleResponse(data.choices[0].text)
        }).catch(err => {
          console.log("Ran out of tokens for today! Try tomorrow!");
        });
}
