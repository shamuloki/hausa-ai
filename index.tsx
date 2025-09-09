// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- START: TypeScript Declarations for Browser APIs ---
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        AudioContext: any;
        webkitAudioContext: any;
    }
    interface SpeechRecognitionEvent extends Event {
        results: SpeechRecognitionResultList;
        resultIndex: number;
    }
}
// --- END: TypeScript Declarations ---

// --- START: Assets ---
const EAGLE_LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoA2A0ADUAAAD6AAA+wAAAAAAAAAACjwAAAOkNDA+uUAAAAFGSURBVHja7N1tSFtVAIbh15O/3mZNEY20BC3iN1gEtY0WltqFlZXaRjdCC3WRJbQlItu06KJLoQWhQ4s2RWgR2oUNgY2gIIi8+b73F5/cO2fumZzcm+59f2D/uOecyZ155s6Zc865C0REREREREREhAVx/xw8B9/An/A//A3/wz+QjA3w7+V/iBIy+T7Y5g5gYfD5gZ3Q4kAZ2Nwv4Gf4N/4B/4N/YGAf5Tso2O3kC+D+N2BnezQh/h/9E/mAxmS8gI/xo4G1v+CH+Bf+Ff+D/o+dM8gQ+3B8iG5uYAR+C/sT25gJc/CD8C5++BTfA5W/iD3g2bM/+CTFhT/BDvBv/BP/Bv/BfWB/P+DfsA+w/wDbQ0I8B/8G/8E/8G/8D/6FF/D/0z/gf/gP/gP/h39gQ7/hP9gH2B8Q2wFDe2A/+Bf+Cf+Df+B/8AmsH8j/h39gH2B/IDYGhvZAf/A/vAf/gf/Bv/A0/gf/gP9gH2B/IDYGhvZAf/A//Av/Bf/Bv/B0/gf/gP9gH2B/IDYGhvZAf/A//A//wz/wb/wX/6H//wf2A/YHBGbA0B7oD/4H/8P/8E/8G/8l/8P//wf2A/YHBGbA0B7oD/4P/8O/8E/8G/8l/8P//wf2A/YHBGbA0B7oD/4P/8P/8A/8G/8l/8P//wf2A/YHBGbA0B7oD/4P/8P/8E/8G/8l/8f/wf2A/YHBGbA0B7oD/4P/8P/8A/8G//F/+P/wD6w/4DYGBjaA/3B//B//A//xv/xf/g/fAPsDwhtgYF9oD/4H/4H/8O/8V/8H/4P7AP7A2JrYGAf9Af/w//wP/wP/8Z/8X/4P7APsD8gtgYG9kB/8D/8B//B//Bv/Bf/h/8B+wD7A2JrYGAf9Af/w//wb/wP/sZ/8X/4P7APsD8gtgYG9kB/8D/8D//DP/Bv/Bf/h/8B+wD7A2JrYGAf9Af/w//wb/wP/sZ/8X/4P7APsD8gtgYG9kB/8D/8D//Bv/Bf/Bf/B/+A+wP6A2BoY2gP9wf/wP/wP/8Z/8b/vH/gH1g/kNiDGxkB/8D/8D//DP/Bv/Bf/B/+B+wD7A2JrYGAf9Af/w//wb/wP/sZ/8b/vH/gH1g/kNiDGxkB/8D/8D//DP/Bv/Bf/B//Bf2A/YH9AbA0M7YH+4H/4H/6H/+A/2B/8D/9hf2B/QGwNDO2B/uB/+B/+h39g/0D+P/wP+wL7A2JrYGAf9Af/w//wP/wP+8P/sD/4H/6H/YH9AbE1MLEDen8R8wN2dYwNDO1pYAP8h9c43/8X/h8iIiIiIiIiIiKSL7WfAYmY9uKCYbCNAAAAAElFTkSuQmCC';

// --- START: Helper Services & Utilities ---
const translations = {
    ha: {
        appTitle: "Hausa AI",
        settings: "Saiti",
        newChat: "Sabon Hira",
        chatHistory: "Tarihin Hira",
        confirmDelete: "Ka tabbata kana son share wannan hirar?",
        youtubeError: "Ba a saita YouTube API Key ba. Don Allah a je Saiti a saka shi.",
        geminiError: "Kuskure: Ba a saita Gemini API Key ba. Don Allah a je Saiti a saka shi.",
        inputPlaceholder: "Rubuta sako ko ka yi magana...",
        unsupportedBrowser: "Kash! Bincikenka baya goyon bayan wannan fasahar.",
        settingsTitle: "Saiti (Settings)",
        passwordLabel: "Kalmar Sirri",
        loginButton: "Shiga",
        geminiApiLabel: "Gemini API Key",
        youtubeApiLabel: "YouTube Data API Key",
        saveButton: "Adana (Save)",
        passwordIncorrect: "Kalmar sirri ba daidai ba ce.",
        keysSavedSuccess: "An adana API Keys cikin nasara.",
        keysSavedError: "An kasa adana API Keys. Wataƙila ma'adanar ta cika.",
        videoSearchError: "An kasa nemo bidiyo. A duba API Key.",
        noVideoFound: "Ba a sami wani bidiyo da ya dace ba.",
        genericError: "Wani kuskure ya faru.",
        searchingVideos: "Ana nemo bidiyoyi...",
        translating: "Ana fassarawa...",
        translationFailed: "An kasa fassarawa",
        newChatTitle: "Sabon Hira",
        chatWithImageTitle: "Hira da Hoto",
        deleteChatTitle: "Share hira",
        newChatButtonTitle: "Sabon Hira",
        developerInfo: "Bayanan Mai Haɓakawa",
        developerName: "Suna",
        developerAddress: "Adireshi",
        chatMode: "Hira",
        livingPhotoMode: "Hoto Rayayye",
        livingPhotoPlaceholder: "Saka hoto don fara tattaunawa...",
        startConversation: "Fara Tattaunawa",
        endConversation: "Kammala Tattaunawa",
        livingPhotoError: "Don Allah a saka hoto don fara tattaunawa.",
        livingPhotoInProgress: "Ana shirya tattaunawar, don Allah a jira...",
        imageGenMode: "Zana Hoto",
        imageGenPlaceholder: "Rubuta dalla-dalla abin da kake so a zana maka...",
        generateButton: "Zana Hoto",
        generatingImage: "Ana zana hoton, don Allah a jira...",
        downloadImage: "Sauke Hoto",
        imageGenError: "An kasa zana hoton. Wataƙila umarnin ya saɓa wa dokokin tsaro. Don Allah a gwada wani abu daban.",
        analyzingPrompt: "Ina nazarin umarninka...",
        creatingMasterpiece: "Yanzu zan fara zanen...",
        unknownPersonError: "Kash! Babu hoton wannan mutumin a bayanaina.",
        rejectedPromptError: "An kasa zana hoton saboda umarnin ya saɓa wa doka.",
        maritalEducationMode: "Ilimin Aure",
        maritalEducationTitle: "Makaratar Ilimin Aure",
        maritalEducationDescription: "Zaɓi darasi don fara koyo game da kyautata zamantakewar aure bisa koyarwar Musulunci.",
        generatingArticle: "Ana shirya darasin, don Allah a jira...",
        backToTopics: "Koma Kan Darussa",
        topic_category_wife: "Darussa Ga Matan Aure",
        topic_category_maiden: "Darussa Ga 'Yan Mata (Budurwai)",
        topic_category_general: "Darussa Na Kowa",
        topics: {
            "intimacy": "Nishaɗi da Jima'i a Musulunci",
            "obedience": "Biyayya ga Miji da Hukunce-hukuncen Fita",
            "trust": "Rikon Amana, Sata, da Gudanar da Dukiyar Miji",
            "character": "Guji Zunubai: Zina, Munafinci, da Karya",
            "in-laws": "Zamantakewa da Dangin Miji",
            "conflict": "Hanyoyin Magance Saɓani da Jayayya",
            "prayer": "Muhimmancin Sallah a Rayuwar Ma'aurata",
            "chastity": "Kiyaye Mutunci da Kamala Kafin Aure",
            "taqwa": "Menene Tsoron Allah na Gaskiya a Aure?"
        }
    },
    en: {
        appTitle: "Hausa AI",
        settings: "Settings",
        newChat: "New Chat",
        chatHistory: "Chat History",
        confirmDelete: "Are you sure you want to delete this chat?",
        youtubeError: "YouTube API Key is not set. Please go to Settings to add it.",
        geminiError: "Error: Gemini API Key is not set. Please go to Settings to add it.",
        inputPlaceholder: "Type a message or use the mic...",
        unsupportedBrowser: "Sorry, your browser does not support this feature.",
        settingsTitle: "Settings",
        passwordLabel: "Password",
        loginButton: "Login",
        geminiApiLabel: "Gemini API Key",
        youtubeApiLabel: "YouTube Data API Key",
        saveButton: "Save",
        passwordIncorrect: "Incorrect password.",
        keysSavedSuccess: "API Keys saved successfully.",
        keysSavedError: "Failed to save API Keys. Storage might be full.",
        videoSearchError: "Could not fetch videos. Check the API Key.",
        noVideoFound: "No relevant videos were found.",
        genericError: "An error occurred.",
        searchingVideos: "Searching for videos...",
        translating: "Translating...",
        translationFailed: "Translation failed",
        newChatTitle: "New Chat",
        chatWithImageTitle: "Chat with Image",
        deleteChatTitle: "Delete chat",
        newChatButtonTitle: "New Chat",
        developerInfo: "Developer Information",
        developerName: "Name",
        developerAddress: "Address",
        chatMode: "Chat",
        livingPhotoMode: "Living Photo",
        livingPhotoPlaceholder: "Upload a photo to start a conversation...",
        startConversation: "Start Conversation",
        endConversation: "End Conversation",
        livingPhotoError: "Please upload a photo to start the conversation.",
        livingPhotoInProgress: "Preparing the conversation, please wait...",
        imageGenMode: "Image Generation",
        imageGenPlaceholder: "Describe the image you want to create in detail...",
        generateButton: "Generate Image",
        generatingImage: "Generating image, please wait...",
        downloadImage: "Download Image",
        imageGenError: "Could not generate the image. The prompt may have violated safety policies. Please try something else.",
        analyzingPrompt: "Analyzing your prompt...",
        creatingMasterpiece: "Creating your masterpiece...",
        unknownPersonError: "Sorry, I don't have an image of that person in my database.",
        rejectedPromptError: "Could not generate the image because the prompt violates safety policies.",
        maritalEducationMode: "Marital Education",
        maritalEducationTitle: "Marital Education School",
        maritalEducationDescription: "Select a topic to start learning about improving marital life based on Islamic teachings.",
        generatingArticle: "Preparing the lesson, please wait...",
        backToTopics: "Back to Topics",
        topic_category_wife: "Lessons for Wives",
        topic_category_maiden: "Lessons for Maidens",
        topic_category_general: "General Lessons",
        topics: {
            "intimacy": "Intimacy and Pleasure in Islam",
            "obedience": "Obedience to the Husband & Rulings on Leaving the House",
            "trust": "Trustworthiness, Theft, and Managing Husband's Property",
            "character": "Avoiding Sins: Adultery, Gossip, and Lying",
            "in-laws": "Living with the Husband's Family",
            "conflict": "Resolving Disagreements and Arguments",
            "prayer": "The Importance of Prayer in Married Life",
            "chastity": "Guarding Chastity and Virtue Before Marriage",
            "taqwa": "What is True Fear of Allah in a Marriage?"
        }
    }
};

const languageService = {
    getLanguage: (): string => {
        try { return localStorage.getItem('hausaAiLanguage') || 'ha'; } 
        catch (e) { return 'ha'; }
    },
    saveLanguage: (lang: string) => {
        try { localStorage.setItem('hausaAiLanguage', lang); } 
        catch (e) { console.error("Error saving language:", e); }
    }
};

const apiKeyStorageService = {
    saveKeys: (keys: { youtube: string; gemini: string; }, t): { success: boolean; message: string } => {
        try {
            keys.youtube ? localStorage.setItem('youtubeApiKey', keys.youtube) : localStorage.removeItem('youtubeApiKey');
            keys.gemini ? localStorage.setItem('geminiApiKey', keys.gemini) : localStorage.removeItem('geminiApiKey');
            return { success: true, message: t('keysSavedSuccess') };
        } catch (error) {
            console.error("Error saving API keys to localStorage:", error);
            return { success: false, message: t('keysSavedError') };
        }
    },
    getKeys: (): { youtube: string | null; gemini: string | null } => {
        try {
            return {
                youtube: localStorage.getItem('youtubeApiKey'),
                gemini: localStorage.getItem('geminiApiKey')
            };
        } catch (error) {
            console.error("Error retrieving API keys from localStorage:", error);
            return { youtube: null, gemini: null };
        }
    },
};

const chatHistoryService = {
    getHistory: (): any[] => {
        try {
            const historyJson = localStorage.getItem('hausaAiChatHistory');
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (error) {
            console.error("Error retrieving chat history:", error);
            return [];
        }
    },
    saveHistory: (history: any[]) => {
        try {
            localStorage.setItem('hausaAiChatHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Error saving chat history:", error);
        }
    }
};
// --- END: Helper Services & Utilities ---


// --- START: Main AI and API Configuration ---
const systemInstructionHausa = `Kai ne "Hausa AI," babban malami mai zurfin ilimin addinin Musulunci, ilimin zamani (boko), da kuma sana'o'i. Yi magana da Hausa mai tsafta, nutsuwa, da hikima. Idan tambayar ta shafi addinin Musulunci, ko al'adun Hausawa na Musulmi, to ka yi amfani da girmamawa kamar "Subhanahu Wa Ta'ala" lokacin da ka ambaci Allah, da kuma "Sallallahu Alaihi Wasallam" ga ManzonSa. Idan tambayar ba ta shafi addini ba (kamar kimmiya, sana'a, ko nishaɗi), ka ba da amsa kai tsaye a cikin harshe mai sauƙi ba tare da waɗannan lafuzzan girmamawa ba. Amsoshinka su kasance masu gamsarwa kuma an goyi bayan su da hujja. Kada ka taba cewa "zan nemo maka bidiyo" ko "ba zan iya nuna bidiyo ba". Kawai ka bayar da amsarka. Idan amsar tana bukatar bidiyo don koyar da sana'a, ka saka alamar [YOUTUBE_SEARCH](kalmomin bincike masu dacewa) a cikin amsarka. Wannan alama umarni ne na sirri ga manhajar, ba don mai amfani ya gani ba. Zaka iya koyar da dukkan darussa 9 na Najeriya daga Firamare 1 zuwa SS3. Idan an baka hoto, kayi bayani a kansa.`;
const systemInstructionEnglish = `You are "Hausa AI," an expert assistant with deep knowledge in modern education, various professions, and general knowledge. Speak in clear, professional English. Your answers should be informative and well-supported. Do not say "I will find a video for you" or "I cannot show you videos". Simply provide your answer. If an answer requires a video to teach a skill, include the tag [YOUTUBE_SEARCH](relevant search terms) in your response. This tag is a private instruction for the application and not for the user to see. You can teach all 9 Nigerian curriculum subjects from Primary 1 to SS3. If given an image, describe and analyze it.`;

const livingPhotoSystemInstructionHausa = `Kai ne mutumin da ke cikin hoton da mai amfani ya bayar. Mai amfani yana so ya yi magana da kai tamkar kana raye. Ka ɗauki halinsa cikin fara'a da ƙauna. Ka fara da gaishe shi/ita da fara'a, ka tambaye shi/ita abin da yake so ku tattauna. Ka kiyaye amsoshinka su zama na hira kuma gajeru. Yi magana da Hausa. Fara gaisuwar da 'Salamu alaikum'.`;
const livingPhotoSystemInstructionEnglish = `You are the person in the image provided by the user. The user wants to have a conversation with you as if you are alive. Embody their persona warmly and lovingly. Greet them and start a natural conversation, asking what they'd like to talk about. Keep your responses conversational and relatively short. Speak in English. Start the greeting with 'Salamu alaikum'.`;

const imageGenAnalysisPromptHausa = (prompt: string) => `Binciki wannan umarnin zanen: "${prompt}". Shin yana neman hoton wani takamaiman mutum ne na gaske? Idan eh, kuma mutumin sananne ne a duniya (kamar shugaban kasa, babban dan wasa, ko fitaccen malami), mayar da martani da cikakken bayanin yadda za'a zana hoton a zahiri da armashi. Idan umarni ne na gama-gari (kamar 'yaro yana wasan kwallo a kauyen afirka'), inganta shi don ya zama zane mai ban sha'awa, mai kama da na gaske, kuma mai nuna al'adun afirka. Idan kuma hoton wanda ba a sani ba ne ko na sirri ne, mayar da martani da wannan rubutun KAWAI: 'UNKNOWN_PERSON'. Idan kuma umarnin ya saɓa wa dokokin tsaro, mayar da martani da wannan rubutun KAWAI: 'REJECTED'.`;
const imageGenAnalysisPromptEnglish = (prompt: string) => `Analyze this image prompt: "${prompt}". Is it asking for a picture of a specific, real person? If yes, and the person is a well-known public figure (like a president, famous athlete, or renowned scholar), respond with a detailed, photorealistic prompt to generate their image artistically. If it is a generic request (e.g., 'a boy playing football in an african village'), enhance the prompt for artistic quality, realism, and to reflect an African aesthetic. If it's a request for a private or unknown person, respond with the exact text 'UNKNOWN_PERSON' ONLY. If the prompt violates safety policies, respond with the exact text 'REJECTED' ONLY.`;

const maritalEducationSystemInstructionHausa = `Kai ne "Hausa AI," babban malami mai ilimi kuma mai ba da shawara kan ilimin aure da zamantakewa a Musulunci. Manufarka ita ce ka ilmantar da al'ummar Hausawa don su gyara zamantakewar aurensu. Yi magana da hikima, nutsuwa, da tausayawa, amma kuma da dalili mai karfi. WAJIBI NE duk amsarka ta dogara da Al-Qur'ani da Hadisi. Ga kowane bayani, kawo aya ko hadisi da ya goyi bayansa. Kuma ka yi bayanin hikimar da ke cikin hukuncin. Amsoshinka su magance matsaloli kamar: rashin nishadi a shimfida da kunya, jayayya da miji, fita ba da izini ba, satar dukiyar miji, munafinci tsakanin makwabta, rashin sallah, da lalacewar 'yan mata. Ka warware shubuhohi da karyata munanan al'adu. Ka cire kunya ta hanyar ilimi, ba batsa ba. Idan bayanin yana buƙatar karin haske na gani, saka alamar [YOUTUBE_SEARCH](kalmomin bincike masu dacewa da ilimin aure a musulunci) a cikin amsarka.`;
const maritalEducationSystemInstructionEnglish = `You are "Hausa AI," a wise and knowledgeable Islamic counselor specializing in marital and social education. Your purpose is to educate the Hausa community to improve their marital lives. Speak with wisdom, calmness, and empathy, but also with strong evidence. It is MANDATORY that all your answers are based on the Qur'an and Hadith. For every point you make, provide the supporting verse or hadith and explain the wisdom behind the ruling. Your answers should address critical issues such as: lack of intimacy and shyness, disobedience to the husband, leaving the house without permission, theft of a husband's property, malicious gossip between neighbors, neglecting prayers, and the moral decay among young women. Dispel misconceptions and refute harmful cultural practices. Remove shame through knowledge, not vulgarity. If the explanation could benefit from a visual aid, include the tag [YOUTUBE_SEARCH](relevant search terms for marital education in Islam).`;
// --- END: Main AI and API Configuration ---


// --- START: React Components ---

const EmbeddedYouTubePlayer = ({ video, onClose }: { video: any; onClose: () => void; }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
             <button 
                onClick={onClose} 
                className="absolute top-2 right-2 z-10 p-2 bg-gray-700 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
                aria-label="Close video player"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                    title={video.snippet.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{video.snippet.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{video.translatedDescription || video.snippet.description}</p>
            </div>
        </div>
    </div>
);


const LivingPhotoConversation = ({ image, messages, onEnd, t, isListening, isSpeaking, language }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-blue-400 shadow-2xl animate-breathing-glow mb-8">
            <img src={URL.createObjectURL(image)} alt="Conversation partner" className="w-full h-full object-cover" />
        </div>
        <div className="text-center text-white max-w-2xl h-20 mb-8">
            <p className="text-xl md:text-2xl font-light transition-opacity duration-500">
                {isSpeaking ? (messages[messages.length - 1]?.text || '...') : (isListening ? '...' : (language === 'ha' ? 'Sauraro...' : 'Listening...'))}
            </p>
        </div>
        <button
            onClick={onEnd}
            className={`px-8 py-4 rounded-full text-white font-bold transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600 glowing-mic' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
            {t('endConversation')}
        </button>
    </div>
);


const YouTubeSearchResults = ({ searchQuery, apiKey, geminiApiKey, onVideoSelect, language, t }: { searchQuery: string, apiKey: string, geminiApiKey: string | null, onVideoSelect: (video: any) => void, language: string, t: (key: string) => string }) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        const fetchAndTranslateVideos = async () => {
            setLoading(true);
            setError('');
            try {
                const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&key=${apiKey}`);
                if (!searchResponse.ok) {
                    const errorData = await searchResponse.json();
                    throw new Error(errorData.error.message || t('videoSearchError'));
                }
                const searchData = await searchResponse.json();
                if (!searchData.items || searchData.items.length === 0) {
                    throw new Error(t('noVideoFound'));
                }

                if (!geminiApiKey || language === 'en') {
                     const initialResults = searchData.items.map(item => ({ ...item, translatedDescription: language === 'en' ? item.snippet.description : `${t('translationFailed')}: ${t('geminiError')}` }));
                     setResults(initialResults);
                     setLoading(false);
                     return;
                }
                
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                const initialResults = searchData.items.map(item => ({ ...item, translatedDescription: t('translating') }));
                setResults(initialResults);

                for (const item of searchData.items) {
                    try {
                        await delay(1200); 
                        const result = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `Fassara wannan bayanin zuwa Hausa a taƙaice kuma a sarari: "${item.snippet.description}"`,
                        });
                        const translatedItem = { ...item, translatedDescription: result.text };
                        setResults(currentResults =>
                            currentResults.map(r => r.id.videoId === item.id.videoId ? translatedItem : r)
                        );
                    } catch (translationError) {
                        console.error("Translation error:", translationError);
                        const failedItem = { ...item, translatedDescription: `${t('translationFailed')}: ${item.snippet.description}` };
                         setResults(currentResults =>
                            currentResults.map(r => r.id.videoId === item.id.videoId ? failedItem : r)
                        );
                    }
                }

            } catch (err: any) {
                setError(err.message || t('genericError'));
            } finally {
                setLoading(false);
            }
        };

        fetchAndTranslateVideos();
    }, [searchQuery, apiKey, geminiApiKey, language, t]);

    if (loading && results.length === 0) return <div className="text-center p-4">{t('searchingVideos')}</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {results.map((item) => (
                <div key={item.id.videoId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300" onClick={() => onVideoSelect(item)}>
                    <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                        <h4 className="font-bold text-md mb-2 truncate">{item.snippet.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 h-20 overflow-hidden text-ellipsis">
                            {item.translatedDescription}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, onSave, youtubeApiKey, geminiApiKey, t }) => {
    const [currentYoutubeApiKey, setCurrentYoutubeApiKey] = useState(youtubeApiKey || '');
    const [currentGeminiApiKey, setCurrentGeminiApiKey] = useState(geminiApiKey || '');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        setCurrentYoutubeApiKey(youtubeApiKey || '');
        setCurrentGeminiApiKey(geminiApiKey || '');
    }, [youtubeApiKey, geminiApiKey, isOpen]);

    const handlePasswordSubmit = () => {
        if (password === 'Nusaibatu@1986') {
            setIsAuthenticated(true);
            setFeedback('');
        } else {
            setFeedback(t('passwordIncorrect'));
        }
    };

    const handleSave = () => {
        const keysToSave = {
            youtube: currentYoutubeApiKey.trim(),
            gemini: currentGeminiApiKey.trim()
        };
        const result = onSave(keysToSave);
        setFeedback(result.message);
        if (result.success) {
            setTimeout(() => {
                onClose();
                resetState();
            }, 1000);
        }
    };

    const resetState = () => {
        setPassword('');
        setIsAuthenticated(false);
        setFeedback('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { onClose(); resetState(); }}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{t('settingsTitle')}</h2>
                {!isAuthenticated ? (
                    <div>
                        <label htmlFor="password" className="block mb-2 font-semibold">{t('passwordLabel')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                        />
                        <button onClick={handlePasswordSubmit} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{t('loginButton')}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="geminiApiKey" className="block mb-2 font-semibold">{t('geminiApiLabel')}</label>
                            <input
                                id="geminiApiKey"
                                type="text"
                                value={currentGeminiApiKey}
                                onChange={(e) => setCurrentGeminiApiKey(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                placeholder={t('geminiApiLabel')}
                            />
                        </div>
                        <div>
                            <label htmlFor="youtubeApiKey" className="block mb-2 font-semibold">{t('youtubeApiLabel')}</label>
                            <input
                                id="youtubeApiKey"
                                type="text"
                                value={currentYoutubeApiKey}
                                onChange={(e) => setCurrentYoutubeApiKey(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                placeholder={t('youtubeApiLabel')}
                            />
                        </div>
                        <button onClick={handleSave} className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">{t('saveButton')}</button>
                    </div>
                )}
                {feedback && <p className={`mt-4 text-sm ${feedback === t('keysSavedSuccess') ? 'text-green-500' : 'text-red-500'}`}>{feedback}</p>}
                 <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">{t('developerInfo')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                        <strong>{t('developerName')}:</strong> nsb com.kano<br/>
                        <strong>{t('developerAddress')}:</strong> Maiduguri Road behind Gaham petroleum Gaya LGA kano
                    </p>
                </div>
            </div>
        </div>
    );
};

const ChatHistorySidebar = ({ history, activeChatId, onNewChat, onSelectChat, onDeleteChat, isOpen, setIsOpen, t }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside className={`absolute md:relative flex flex-col w-64 bg-white dark:bg-gray-800 h-full border-r border-gray-200 dark:border-gray-700 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t('chatHistory')}</h2>
                    <button onClick={onNewChat} title={t('newChatButtonTitle')} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {history.slice().reverse().map(chat => (
                        <div
                            key={chat.id}
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${activeChatId === chat.id ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <span className="truncate flex-1 text-sm">{chat.title || t('newChatTitle')}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 p-1 transition-opacity"
                                title={t('deleteChatTitle')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};


const DrawingAnimation = ({ statusMessage }) => (
    <div className="flex flex-col items-center justify-center space-y-4 text-gray-500 dark:text-gray-400">
        <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 85 50 L 55 50 L 55 20 C 55 10 45 10 45 20 L 45 50 L 15 50" stroke="#9ca3af" strokeWidth="2" fill="none" className="pencil-body" />
            <path d="M 55 20 L 50 10 L 45 20 Z" fill="#facc15" />
            <path d="M 50 10 L 50 5 Z" stroke="#374151" strokeWidth="2" fill="none" />
            <path d="M 15 50 L 10 55 L 15 60" stroke="#fca5a5" strokeWidth="2" fill="none" />
            <g className="animate-hand-draw">
                <path d="M 10 80 Q 30 70 50 80 T 90 80" stroke="#60a5fa" strokeWidth="2" fill="none" className="animate-drawing-line" />
            </g>
        </svg>
        <p className="text-lg font-semibold animate-pulse">{statusMessage}</p>
    </div>
);


const MaritalEducationView = ({ geminiApiKey, youtubeApiKey, language, t, renderMessageContent }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [articleContent, setArticleContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const topicCategories = {
        ha: [
            { category: t('topic_category_wife'), topics: ['intimacy', 'obedience', 'trust', 'character', 'in-laws', 'conflict', 'prayer'] },
            { category: t('topic_category_maiden'), topics: ['chastity'] },
            { category: t('topic_category_general'), topics: ['taqwa'] }
        ],
        en: [
            { category: t('topic_category_wife'), topics: ['intimacy', 'obedience', 'trust', 'character', 'in-laws', 'conflict', 'prayer'] },
            { category: t('topic_category_maiden'), topics: ['chastity'] },
            { category: t('topic_category_general'), topics: ['taqwa'] }
        ]
    };
    
    const handleTopicSelect = async (topicKey) => {
        setSelectedTopic(topicKey);
        setIsLoading(true);
        setError('');
        setArticleContent('');

        if (!geminiApiKey) {
            setError(t('geminiError'));
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const systemInstruction = language === 'ha' ? maritalEducationSystemInstructionHausa : maritalEducationSystemInstructionEnglish;
            const userPrompt = `${t(`topics.${topicKey}`)}`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction },
            });
            setArticleContent(result.text);

        } catch (err) {
            console.error("Article Generation Error:", err);
            setError(t('genericError'));
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedTopic) {
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <button onClick={() => setSelectedTopic(null)} className="mb-4 flex items-center text-blue-500 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {t('backToTopics')}
                </button>
                <h2 className="text-3xl font-bold mb-4">{t(`topics.${selectedTopic}`)}</h2>
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                           <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                           <span className="ml-2">{t('generatingArticle')}</span>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {articleContent && renderMessageContent({ text: articleContent })}
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">{t('maritalEducationTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-center mb-8">{t('maritalEducationDescription')}</p>
            <div className="w-full max-w-4xl space-y-8">
                {topicCategories[language].map((cat, index) => (
                    <div key={index}>
                        <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b-2 border-blue-500 pb-2">{cat.category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cat.topics.map(topicKey => (
                                <button 
                                    key={topicKey} 
                                    onClick={() => handleTopicSelect(topicKey)}
                                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl hover:bg-blue-50 dark:hover:bg-gray-700 text-left transition-all duration-300"
                                >
                                    <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{t(`topics.${topicKey}`)}</h4>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

const HausaAI = () => {
    const [appMode, setAppMode] = useState<'chat' | 'livingPhoto' | 'imageGeneration' | 'maritalEducation'>('chat');
    const [language, setLanguage] = useState(languageService.getLanguage());
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isConversationModeActive, setIsConversationModeActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [youtubeApiKey, setYoutubeApiKey] = useState<string | null>(null);
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
    const [currentlySpeakingMessageIndex, setCurrentlySpeakingMessageIndex] = useState<number | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Living Photo State
    const [isLivingPhotoSessionActive, setIsLivingPhotoSessionActive] = useState(false);
    const [livingPhotoImage, setLivingPhotoImage] = useState<File | null>(null);
    const [livingPhotoMessages, setLivingPhotoMessages] = useState([]);
    const [isPreparingLivingPhoto, setIsPreparingLivingPhoto] = useState(false);

    // Image Generation State
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageGenError, setImageGenError] = useState<string | null>(null);
    const [generatingStatusMessage, setGeneratingStatusMessage] = useState('');


    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const speechQueueRef = useRef<string[]>([]);
    const isSpeakingRef = useRef(false);
    const speechBufferRef = useRef('');


    const t = useCallback((key: string, options?: any) => {
        const lang_dict = translations[language];
        const key_parts = key.split('.');
        let translation = lang_dict;
        for (const part of key_parts) {
            if (translation && typeof translation === 'object' && part in translation) {
                translation = translation[part];
            } else {
                return key;
            }
        }
        return translation;
    }, [language]);
    const activeChat = chatHistory.find(c => c.id === activeChatId);
    const messages = activeChat ? activeChat.messages : [];

    // --- START: Lifecycle and State Management ---
    useEffect(() => {
        const keys = apiKeyStorageService.getKeys();
        setYoutubeApiKey(keys.youtube);
        setGeminiApiKey(keys.gemini);
        
        const loadedHistory = chatHistoryService.getHistory();
        if (loadedHistory.length > 0) {
            setChatHistory(loadedHistory);
            setActiveChatId(loadedHistory[loadedHistory.length - 1].id);
        } else {
            handleNewChat(false);
        }
    }, []);

     useEffect(() => {
        if (appMode === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, appMode]);

    useEffect(() => {
        if (chatHistory.length > 0 && appMode === 'chat') {
            chatHistoryService.saveHistory(chatHistory);
        }
    }, [chatHistory, appMode]);
    
    useEffect(() => {
        languageService.saveLanguage(language);
        document.documentElement.lang = language;
        cancelSpeech();
        if (isLivingPhotoSessionActive) handleEndLivingPhotoSession();
    }, [language]);
    
    useEffect(() => {
        cancelSpeech();
        return () => cancelSpeech();
    }, [activeChatId]);
    
    useEffect(() => {
        // Reset state when switching modes
        setUserInput('');
        setSelectedImage(null);
        cancelSpeech();
        if (isLivingPhotoSessionActive) handleEndLivingPhotoSession();
    }, [appMode]);

    useEffect(() => {
        const findAndSetVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;
            const targetLang = language === 'ha' ? 'ha' : 'en';
            const googleVoice = voices.find(v => v.lang.startsWith(targetLang) && v.name.includes('Google'));
            const anyVoice = voices.find(v => v.lang.startsWith(targetLang));
            setSelectedVoice(googleVoice || anyVoice || null);
        };
        findAndSetVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = findAndSetVoice;
        }
    }, [language]);
    // --- END: Lifecycle and State Management ---

    const startRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('unsupportedBrowser'));
            if (isConversationModeActive) setIsConversationModeActive(false);
            if (isLivingPhotoSessionActive) handleEndLivingPhotoSession();
            return;
        }
        if (isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ha' ? 'ha-NG' : 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech' && (isConversationModeActive || isLivingPhotoSessionActive)) {
                 // Silently end and wait for the next turn if conversation mode is active
            } else {
                if (isConversationModeActive) setIsConversationModeActive(false);
                if (isLivingPhotoSessionActive) handleEndLivingPhotoSession();
            }
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            if (event.results[event.results.length - 1].isFinal) {
                if(appMode === 'chat') setUserInput(transcript);
                setTimeout(() => handleFormSubmit(undefined, transcript), 200);
            } else {
                 if(appMode === 'chat') setUserInput(transcript);
            }
        };
        recognition.start();
    }, [language, t, isListening, isConversationModeActive, isLivingPhotoSessionActive, appMode]);
    
    // --- START: Speech Synthesis Engine (Web Speech API) ---
    const playNextInQueue = useCallback(() => {
        if (isSpeakingRef.current || speechQueueRef.current.length === 0) {
            if (speechQueueRef.current.length === 0 && !isSpeakingRef.current) {
                setCurrentlySpeakingMessageIndex(null);
                if (isConversationModeActive || isLivingPhotoSessionActive) {
                    startRecognition();
                }
            }
            return;
        }

        isSpeakingRef.current = true;
        const textToSpeak = speechQueueRef.current.shift();
        
        const cleanedText = textToSpeak.replace(/\[YOUTUBE_SEARCH\]\((.*?)\)/g, '').trim();
        if (!cleanedText) {
            isSpeakingRef.current = false;
            playNextInQueue();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.lang = language === 'ha' ? 'ha-NG' : 'en-US';
        utterance.rate = 1.1; 
        utterance.pitch = 1.5;

        utterance.onend = () => {
            isSpeakingRef.current = false;
            setTimeout(() => playNextInQueue(), 200);
        };
        
        utterance.onerror = (e) => {
            console.error("SpeechSynthesisUtterance error:", e);
            isSpeakingRef.current = false;
            playNextInQueue();
        };

        window.speechSynthesis.speak(utterance);
        
    }, [language, isConversationModeActive, isLivingPhotoSessionActive, startRecognition, selectedVoice]);
    
    const processSpeechChunk = useCallback((chunk: string) => {
        speechBufferRef.current += chunk;
        const phrases = speechBufferRef.current.split(/(?<=[.?!,])\s+/);

        if (phrases.length > 1) {
            const completePhrases = phrases.slice(0, -1);
            speechBufferRef.current = phrases[phrases.length - 1];
            speechQueueRef.current.push(...completePhrases);
            if (!isSpeakingRef.current) {
                playNextInQueue();
            }
        }
    }, [playNextInQueue]);

    const flushSpeechBuffer = useCallback(() => {
        const remainingText = speechBufferRef.current.trim();
        if (remainingText) {
            speechQueueRef.current.push(remainingText);
            speechBufferRef.current = '';
            if (!isSpeakingRef.current) {
                playNextInQueue();
            }
        } else {
             if (speechQueueRef.current.length === 0 && !isSpeakingRef.current){
                 setCurrentlySpeakingMessageIndex(null);
                 if(isConversationModeActive || isLivingPhotoSessionActive){
                    startRecognition();
                 }
             }
        }
    }, [playNextInQueue, isConversationModeActive, isLivingPhotoSessionActive, startRecognition]);
    
    const cancelSpeech = useCallback(() => {
        if (window.speechSynthesis) {
             window.speechSynthesis.cancel();
        }
        isSpeakingRef.current = false;
        speechQueueRef.current = [];
        speechBufferRef.current = '';
        setCurrentlySpeakingMessageIndex(null);
    }, []);
    // --- END: Speech Synthesis Engine ---

    // --- START: Chat History Management ---
    const handleNewChat = (addToHistory = true) => {
        cancelSpeech();
        setIsConversationModeActive(false);
        const newChatId = Date.now();
        const newChat = { id: newChatId, title: t('newChatTitle'), messages: [] };
        if (addToHistory) {
            setChatHistory(prev => [...prev, newChat]);
        } else {
             setChatHistory([newChat]);
        }
        setActiveChatId(newChatId);
        setUserInput('');
        setSelectedImage(null);
        setIsSidebarOpen(false);
    };

    const handleSelectChat = (id) => {
        if (activeChatId !== id) {
             setActiveChatId(id);
             setIsSidebarOpen(false);
             setIsConversationModeActive(false);
        }
    };

    const handleDeleteChat = (idToDelete) => {
        if (window.confirm(t('confirmDelete'))) {
            const newHistory = chatHistory.filter(chat => chat.id !== idToDelete);
            setChatHistory(newHistory);

            if (activeChatId === idToDelete) {
                cancelSpeech();
                setIsConversationModeActive(false);
                if (newHistory.length > 0) {
                    setActiveChatId(newHistory[newHistory.length - 1].id);
                } else {
                    handleNewChat(false);
                }
            }
        }
    };
    // --- END: Chat History Management ---
    
    const handleApiKeysSave = (keys: { youtube: string; gemini: string; }) => {
        const result = apiKeyStorageService.saveKeys(keys, t);
        if (result.success) {
            setYoutubeApiKey(keys.youtube);
            setGeminiApiKey(keys.gemini);
        }
        return result;
    };
    
    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

    const updateChatHistory = (chatId, updateFn) => {
        setChatHistory(prevHistory => prevHistory.map(chat => chat.id === chatId ? updateFn(chat) : chat));
    };

    const handleFormSubmit = async (e?: React.FormEvent, voiceInput?: string) => {
        e?.preventDefault();
        if (isLivingPhotoSessionActive) {
            await handleLivingPhotoMessage(voiceInput);
        } else if (appMode === 'chat') {
            await handleChatSubmit(voiceInput);
        } else if (appMode === 'livingPhoto') {
            await handleStartLivingPhotoSession();
        }
    };
    
    const handleImageGenerationSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const userPrompt = imageGenPrompt.trim();
        if (!userPrompt) return;
        if (!geminiApiKey) {
            setImageGenError(t('geminiError'));
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImageUrl(null);
        setImageGenError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            
            // Step 1: Analyze and enhance the prompt
            setGeneratingStatusMessage(t('analyzingPrompt'));
            const analysisPrompt = language === 'ha' ? imageGenAnalysisPromptHausa(userPrompt) : imageGenAnalysisPromptEnglish(userPrompt);
            const analysisResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: analysisPrompt,
            });
            const enhancedPrompt = analysisResult.text.trim();

            if (enhancedPrompt === 'UNKNOWN_PERSON') {
                throw new Error(t('unknownPersonError'));
            }
            if (enhancedPrompt === 'REJECTED') {
                 throw new Error(t('rejectedPromptError'));
            }

            // Step 2: Generate the image with the enhanced prompt
            setGeneratingStatusMessage(t('creatingMasterpiece'));
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: enhancedPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
            });

            if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImageUrl(imageUrl);
            } else {
                 console.error("Invalid response from image generation API:", response);
                 throw new Error(t('imageGenError'));
            }

        } catch (error: any) {
            console.error("Image Generation Error:", error);
            setImageGenError(error.message || t('imageGenError'));
        } finally {
            setIsGeneratingImage(false);
            setGeneratingStatusMessage('');
        }
    };

    const handleStartLivingPhotoSession = async () => {
        if (!selectedImage) {
            alert(t('livingPhotoError'));
            return;
        }
        if (!geminiApiKey) {
            alert(t('geminiError'));
            return;
        }

        setIsPreparingLivingPhoto(true);
        setLivingPhotoImage(selectedImage);
        
        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const base64Image = await fileToBase64(selectedImage);
            const imagePart = { inlineData: { mimeType: selectedImage.type, data: base64Image } };
            const textPart = { text: "Start the conversation." }; // Initial prompt to get a greeting

            const systemInstruction = language === 'ha' ? livingPhotoSystemInstructionHausa : livingPhotoSystemInstructionEnglish;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: { systemInstruction },
            });
            
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if(chunkText) {
                    fullResponse += chunkText;
                    processSpeechChunk(chunkText);
                }
            }
            flushSpeechBuffer();
            setLivingPhotoMessages([{ text: fullResponse, sender: 'ai' }]);
            setIsLivingPhotoSessionActive(true);

        } catch (error) {
            console.error("Living Photo Start Error:", error);
            alert(t('genericError'));
        } finally {
            setIsPreparingLivingPhoto(false);
            setSelectedImage(null);
        }
    };

    const handleEndLivingPhotoSession = () => {
        cancelSpeech();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsLivingPhotoSessionActive(false);
        setLivingPhotoImage(null);
        setLivingPhotoMessages([]);
    };

    const handleLivingPhotoMessage = async (voiceInput?: string) => {
        const textPrompt = voiceInput?.trim();
        if (!textPrompt || !livingPhotoImage || isLoading) return;
        
        cancelSpeech();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        
        setIsLoading(true);
        const userMessage = { text: textPrompt, sender: 'user' };
        setLivingPhotoMessages(prev => [...prev, userMessage]);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const base64Image = await fileToBase64(livingPhotoImage);

            const historyParts = livingPhotoMessages.flatMap(msg => [
                { text: `Previous AI message: ${msg.text}` },
            ]);
            
            const currentParts = [
                { inlineData: { mimeType: livingPhotoImage.type, data: base64Image } },
                ...historyParts,
                { text: `User's new message: ${textPrompt}` },
            ];

            const systemInstruction = language === 'ha' ? livingPhotoSystemInstructionHausa : livingPhotoSystemInstructionEnglish;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: { parts: currentParts },
                config: { systemInstruction },
            });
            
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponse += chunkText;
                    processSpeechChunk(chunkText);
                }
            }
            flushSpeechBuffer();
            setLivingPhotoMessages(prev => [...prev, { text: fullResponse, sender: 'ai' }]);
            
        } catch (error) {
            console.error("Living Photo Message Error:", error);
            const errorMessage = { text: t('genericError'), sender: 'ai' };
            setLivingPhotoMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSubmit = async (voiceInput?: string) => {
        const textPrompt = voiceInput || userInput.trim();
        if ((!textPrompt && !selectedImage) || !activeChatId || isLoading) return;

        cancelSpeech();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        if (!geminiApiKey) {
            const errorMessage = { text: t('geminiError'), sender: 'ai' };
            updateChatHistory(activeChatId, chat => ({ ...chat, messages: [...chat.messages, errorMessage] }));
            setIsConversationModeActive(false);
            return;
        }

        setIsLoading(true);
        const userMessage = { text: textPrompt, image: selectedImage, sender: 'user' };
        const aiMessagePlaceholder = { text: '', sender: 'ai' };
        
        let aiMessageIndex;
        updateChatHistory(activeChatId, chat => {
            const isFirstMessage = chat.messages.length === 0;
            const newTitle = isFirstMessage ? (textPrompt.substring(0, 30) || t('chatWithImageTitle')) : chat.title;
            const newMessages = [...chat.messages, userMessage, aiMessagePlaceholder];
            aiMessageIndex = newMessages.length - 1;
            return { ...chat, title: newTitle, messages: newMessages };
        });

        setUserInput('');
        setSelectedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const parts: any[] = [{ text: textPrompt }];
            if (selectedImage) {
                const base64Image = await fileToBase64(selectedImage);
                parts.unshift({ inlineData: { mimeType: selectedImage.type, data: base64Image } });
            }

            const systemInstruction = language === 'ha' ? systemInstructionHausa : systemInstructionEnglish;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: { systemInstruction }
            });
            
            let fullResponse = '';
            setCurrentlySpeakingMessageIndex(aiMessageIndex);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if(chunkText){
                    fullResponse += chunkText;
                    updateChatHistory(activeChatId, chat => {
                        const updatedMessages = [...chat.messages];
                        if(updatedMessages[aiMessageIndex]){
                             updatedMessages[aiMessageIndex].text = fullResponse;
                        }
                        return { ...chat, messages: updatedMessages };
                    });
                    processSpeechChunk(chunkText);
                }
            }
            flushSpeechBuffer();
            
        } catch (error: any) {
            const errorMessage = { text: `${t('genericError')}: ${error.message}`, sender: 'ai' };
             updateChatHistory(activeChatId, chat => {
                const updatedMessages = [...chat.messages];
                if(updatedMessages[aiMessageIndex]){
                    updatedMessages[aiMessageIndex] = errorMessage;
                } else {
                    updatedMessages.push(errorMessage);
                }
                return { ...chat, messages: updatedMessages };
            });
            setIsConversationModeActive(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVoiceInput = () => {
        if (isConversationModeActive) {
            setIsConversationModeActive(false);
            if (recognitionRef.current) recognitionRef.current.stop();
            cancelSpeech();
        } else {
            setIsConversationModeActive(true);
            startRecognition();
        }
    };


    const renderMessageContent = (message) => {
        const youtubeSearchRegex = /\[YOUTUBE_SEARCH\]\((.*?)\)/g;
        let lastIndex = 0;
        const parts = [];
        
        message.text.replace(youtubeSearchRegex, (match, searchQuery, offset) => {
            if (offset > lastIndex) {
                parts.push(message.text.substring(lastIndex, offset));
            }
            parts.push({ isComponent: true, searchQuery });
            lastIndex = offset + match.length;
        });

        if (lastIndex < message.text.length) {
            parts.push(message.text.substring(lastIndex));
        }

        return (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                {parts.map((part, index) => {
                    if (typeof part === 'string') {
                        return <div key={index} style={{whiteSpace: 'pre-wrap'}}>{part}</div>;
                    } else if (part.isComponent) {
                         if (youtubeApiKey) {
                            return (
                                <YouTubeSearchResults
                                    key={index}
                                    searchQuery={part.searchQuery}
                                    apiKey={youtubeApiKey}
                                    geminiApiKey={geminiApiKey}
                                    onVideoSelect={(video) => setSelectedVideo(video)}
                                    language={language}
                                    t={t}
                                />
                            );
                        } else {
                             return (
                                 <div key={index} className="text-amber-500 text-center p-4 border border-amber-500 rounded-md mt-4">
                                    {t('youtubeError')}
                                </div>
                            );
                        }
                    }
                    return null;
                })}
            </div>
        );
    };

    return (
        <div className="flex h-screen max-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
             {appMode === 'chat' && <ChatHistorySidebar
                history={chatHistory}
                activeChatId={activeChatId}
                onNewChat={() => handleNewChat()}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                t={t}
            />}
            <div className="flex flex-col flex-1 h-screen relative">
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                         {appMode === 'chat' && <button onClick={() => setIsSidebarOpen(true)} className="p-2 md:hidden text-gray-600 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>}
                        <img src={EAGLE_LOGO_URL} alt="Hausa AI Logo" className="h-8 w-8" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('appTitle')}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-sm font-semibold flex-wrap">
                            <button onClick={() => setAppMode('chat')} className={`px-3 py-1 rounded-full ${appMode === 'chat' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {t('chatMode')}
                            </button>
                            <button onClick={() => setAppMode('livingPhoto')} className={`px-3 py-1 rounded-full ${appMode === 'livingPhoto' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {t('livingPhotoMode')}
                            </button>
                             <button onClick={() => setAppMode('imageGeneration')} className={`px-3 py-1 rounded-full ${appMode === 'imageGeneration' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {t('imageGenMode')}
                            </button>
                            <button onClick={() => setAppMode('maritalEducation')} className={`px-3 py-1 rounded-full ${appMode === 'maritalEducation' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                {t('maritalEducationMode')}
                            </button>
                        </div>
                        <button onClick={() => setLanguage(lang => lang === 'ha' ? 'en' : 'ha')} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-semibold py-1 px-3 border border-gray-400 rounded-full text-sm">
                            {language === 'ha' ? 'EN' : 'HA'}
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} title={t('settings')} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </header>
                
                {appMode === 'chat' && (
                     <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'} ${currentlySpeakingMessageIndex === index ? 'pulse-border' : ''}`}>
                                    {msg.sender === 'user' && msg.image && <img src={URL.createObjectURL(msg.image)} alt="Selected" className="max-w-xs rounded-lg mb-2" />}
                                    {renderMessageContent(msg)}
                                </div>
                            </div>
                        ))}
                        {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                             <div className="flex justify-start">
                                <div className="max-w-xl p-3 rounded-lg bg-white dark:bg-gray-700">
                                   <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                   </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </main>
                )}
                
                {appMode === 'livingPhoto' && (
                     <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                        <h2 className="text-3xl font-bold mb-2">{t('livingPhotoMode')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">{t('livingPhotoPlaceholder')}</p>
                         <div className="mt-8">
                             {selectedImage ? (
                                <div className="relative inline-block">
                                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-48 h-48 rounded-full object-cover border-4 border-gray-300" />
                                     <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold">X</button>
                                </div>
                             ) : (
                                <label htmlFor="image-upload-living" className="flex flex-col items-center justify-center w-48 h-48 rounded-full border-2 border-dashed border-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="mt-2 text-sm text-gray-500">{language === 'ha' ? 'Saka Hoto' : 'Upload Photo'}</span>
                                </label>
                             )}
                              <input id="image-upload-living" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setSelectedImage(e.target.files[0])} />
                         </div>
                          <div className="mt-8 w-full max-w-sm">
                            <button 
                                onClick={handleStartLivingPhotoSession} 
                                disabled={isPreparingLivingPhoto || !selectedImage} 
                                className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                             >
                                {isPreparingLivingPhoto ? t('livingPhotoInProgress') : t('startConversation')}
                            </button>
                         </div>
                    </main>
                )}

                {appMode === 'imageGeneration' && (
                     <main className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-2xl">
                            <h2 className="text-3xl font-bold mb-2 text-center">{t('imageGenMode')}</h2>
                             <form onSubmit={handleImageGenerationSubmit} className="w-full">
                                <textarea
                                    value={imageGenPrompt}
                                    onChange={(e) => setImageGenPrompt(e.target.value)}
                                    placeholder={t('imageGenPlaceholder')}
                                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                    rows={4}
                                    disabled={isGeneratingImage}
                                />
                                <button type="submit" disabled={isGeneratingImage || !imageGenPrompt} className="mt-4 w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg">
                                    {isGeneratingImage ? t('generatingImage') : t('generateButton')}
                                </button>
                            </form>
                            <div className="mt-6 w-full flex flex-col items-center justify-center">
                                {isGeneratingImage && <DrawingAnimation statusMessage={generatingStatusMessage} />}
                                {imageGenError && <p className="text-red-500 text-center mt-4">{imageGenError}</p>}
                                {generatedImageUrl && (
                                    <div className="mt-4 w-full max-w-lg text-center">
                                        <img src={generatedImageUrl} alt="Generated" className="rounded-lg shadow-lg w-full h-auto" />
                                        <a href={generatedImageUrl} download="hausa-ai-image.jpg" className="mt-4 inline-block bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 font-semibold">
                                            {t('downloadImage')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                )}

                {appMode === 'maritalEducation' && (
                    <MaritalEducationView 
                        geminiApiKey={geminiApiKey}
                        youtubeApiKey={youtubeApiKey}
                        language={language}
                        t={t}
                        renderMessageContent={renderMessageContent}
                    />
                )}

                 <footer className={`p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${appMode !== 'chat' ? 'hidden' : ''}`}>
                    {selectedImage && (
                        <div className="relative mb-2 w-24">
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-auto rounded-md" />
                            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">X</button>
                        </div>
                    )}
                    <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                        <label htmlFor="image-upload" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setSelectedImage(e.target.files[0])} />
                        </label>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className="flex-1 p-2 border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button type="button" onClick={handleVoiceInput} className={`p-3 rounded-full text-white transition-colors ${isConversationModeActive ? 'bg-red-500 glowing-mic' : 'bg-blue-500 hover:bg-blue-600'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
                        </button>
                        <button type="submit" disabled={isLoading || (!userInput && !selectedImage)} className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        </button>
                    </form>
                </footer>
                <SettingsModal 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                    onSave={handleApiKeysSave}
                    youtubeApiKey={youtubeApiKey}
                    geminiApiKey={geminiApiKey}
                    t={t}
                />
                 {selectedVideo && <EmbeddedYouTubePlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
                 {isLivingPhotoSessionActive && livingPhotoImage && (
                    <LivingPhotoConversation 
                        image={livingPhotoImage}
                        messages={livingPhotoMessages}
                        onEnd={handleEndLivingPhotoSession}
                        t={t}
                        isListening={isListening}
                        isSpeaking={isSpeakingRef.current}
                        language={language}
                    />
                 )}
            </div>
        </div>
    );
};
// --- END: React Components ---

const root = createRoot(document.getElementById('root')!);
root.render(<HausaAI />);