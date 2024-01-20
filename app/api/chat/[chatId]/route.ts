import { StreamingTextResponse, LangChainStream } from 'ai';
import { auth, currentUser } from '@clerk/nextjs';
import { CallbackManager } from 'langchain/callbacks';
import { Replicate } from 'langchain/llms/replicate';
import { NextResponse } from 'next/server';

import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import prismadb from '@/lib/prismadb';

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const identifier = request.url + '-' + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse('Ratelimit exceeded', { status: 429 });
    }

    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: user.id
          }
        }
      }
    });

    if (!companion) {
      return new NextResponse('Companion not found', { status: 404 });
    }

    const name = companion.id;
    const companion_file_name = name + '.txt';

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: 'llama2-13b'
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey);
    }

    await memoryManager.writeToHistory('User: ' + prompt + '\n', companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

    const similarDocs = await memoryManager.vectorSearch(recentChatHistory, companion_file_name);

    let relevantHistory = '';

    if (!!similarDocs && similarDocs.length === 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join('\n');
    }

    const { handlers } = LangChainStream();

    const model = new Replicate({
      model:
        'meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d',
      input: {
        max_length: 2048
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers)
    });

    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
          ONLY generate responses in plain sentences without any ${companion.name} prefixes, line breaks, or additional formatting. Responses should directly and concisely answer the question or statement provided, without any introduction or preamble.
          Below are relevant details about the conversation's context, including any necessary background information:
          - instructions start -
          ${companion.instructions}
          - instructions end -
  
          Below are relevant details about ${companion.name}'s past and the conversation you are in:
          - relevant history start -
          ${relevantHistory}
          - relevant history end -
          - recent chat history start -
          ${recentChatHistory}\n${companion.name}:
          - recent chat history end -
          `
        )
        .catch(console.error)
    );

    // const cleaned = resp.replaceAll(',', '');
    // const chunks = cleaned.split('\n');
    // const response = chunks[0];

    // New parsing logic to extract the relevant response
    const responseDelimiter = 'User:'; // Define the delimiter
    const splitResponses = resp.split(responseDelimiter);
    let response = splitResponses[splitResponses.length - 1].trim(); // Get the last part

    // Additional parsing to dynamically remove the character name
    const characterName = companion.name + ':'; // Use the companion's name
    if (response.startsWith(characterName)) {
      response = response.substring(characterName.length).trim();
    }

    // Additional step to remove the repeated question
    const questionEndIndex = response.indexOf('\n');
    if (questionEndIndex !== -1) {
      response = response.substring(questionEndIndex + 1).trim();
    }

    if (response) {
      // Clean the response if needed
      response = response.replaceAll('\n', ' ').trim(); // Example: remove line breaks and trim

      await memoryManager.writeToHistory(response, companionKey);

      // Update the chat history in your database
      if (response.length > 1) {
        await prismadb.companion.update({
          where: {
            id: params.chatId
          },
          data: {
            messages: {
              create: {
                content: response,
                role: 'system',
                userId: user.id
              }
            }
          }
        });
      }
    }

    // Create a stream for the response
    var Readable = require('stream').Readable;
    let s = new Readable();
    s.push(response);
    s.push(null);

    return new StreamingTextResponse(s);
  } catch (error) {
    console.log('[CHAT_POST]: ', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
