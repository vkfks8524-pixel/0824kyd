'use strict';
// A dated editorial selection, not a live trend feed or a traffic forecast.
module.exports = {
  checked: '2026-10-05',
  ranking: {
    publisher: 'Ahrefs', edition: 'September 2026', updated: '2026-09-01',
    url: 'https://ahrefs.com/blog/top-google-searches/',
    section: 'Top 100 Google searches globally',
    metric: 'Estimated monthly search volume',
    methodology: 'https://help.ahrefs.com/en/articles/2138010-what-is-the-difference-between-traffic-potential-and-search-volume-in-keywords-explorer',
    rows: [
      {rank: 1, query: 'chatgpt', volume: 811195000, slug: 'chatgpt-beginners-verify-answers'},
      {rank: 2, query: 'whatsapp web', volume: 482840000, slug: 'whatsapp-web-link-unlink-devices'},
      {rank: 3, query: 'youtube', volume: 383003000, slug: 'youtube-watch-history-recommendations'},
      {rank: 4, query: 'chat gpt', volume: 320598000, slug: 'chatgpt-privacy-before-uploading'},
      {rank: 5, query: 'translate', volume: 235233000, slug: 'google-translate-check-before-sending'}
    ]
  },
  posts: {
    'chatgpt-beginners-verify-answers': {
      title: 'ChatGPT for beginners: write a useful prompt and verify the answer',
      description: 'Turn a vague ChatGPT request into a useful draft with a worked planning example, a fact-checking table and clear limits on unsupported answers.',
      category: 'Web & AI · Getting started',
      lead: 'Start with a small task whose result you can check. Explain the outcome, provide only the relevant context, and decide what a correct answer must preserve. A confident response is a draft to inspect, not evidence by itself.',
      scope: 'This is a source-based beginner workflow, not a model benchmark or a claim that every account has the same tools. The examples below are fictional KYD exercises, not recorded ChatGPT outputs.',
      body: `<h2>Choose a task with a visible finish line</h2>
<p>“Help me organize my trip” gives you little way to judge success. “Turn these three confirmed arrival times into a pickup checklist” gives you something concrete to compare with the inputs. For a first exercise, prefer rewriting non-private notes, organizing a list or explaining a passage you can independently read.</p>
<p>In <a href="https://learn.chatgpt.com/docs/use-chatgpt" rel="noopener noreferrer">OpenAI’s usage guidance</a>, the workflow starts with a request, adds relevant context and improves the result through review. Tool access can depend on your account and surface. This guide does not require a paid model, a connected account or a purchase.</p>
<h2>A worked example: organize an imaginary weekend</h2>
<p>Suppose your fictional group has three confirmed activities: a museum visit on Saturday at 10:00, lunch at 13:00 and a train home on Sunday at 18:00. You need a checklist, not invented venue recommendations. Keep the facts and missing facts separate before prompting.</p>
<blockquote><p>Create a weekend preparation checklist from these confirmed plans: museum Saturday 10:00; lunch Saturday 13:00; return train Sunday 18:00. Use a table with Task, When to check, and What I still need to confirm. Do not invent addresses, ticket prices, journey times or opening hours. Put unknown details in the confirmation column. Keep all three confirmed times unchanged.</p></blockquote>
<p>This original example narrows the job to organization. It does not ask the system to pretend it knows the location or fill gaps with plausible details. A useful result might remind you to confirm tickets and transport; it should not manufacture a claim that the museum closes at 17:00.</p>
<div class="table-wrap"><table><caption>KYD review checklist for the fictional prompt</caption><thead><tr><th>Check</th><th>Acceptable result</th><th>Reason to revise</th></tr></thead><tbody><tr><td>Fixed facts</td><td>All three input times remain unchanged</td><td>A different time appears without a source</td></tr><tr><td>Unknowns</td><td>Location, opening hours and fares are flagged</td><td>Specific values are invented</td></tr><tr><td>Format</td><td>Three requested columns are present</td><td>A long travel essay replaces the checklist</td></tr><tr><td>Action</td><td>You receive a draft to review</td><td>The response implies tickets were booked</td></tr></tbody></table></div>
<h2>Use context where it changes the result</h2>
<p><a href="https://learn.chatgpt.com/docs/prompting" rel="noopener noreferrer">OpenAI’s prompting documentation</a> recommends clarifying the goal, useful context, desired output and boundaries when they matter. A short question can still be enough. Longer is not automatically better; a page of unrelated instructions can obscure the few facts you need preserved.</p>
<p>If the checklist is for someone with limited walking capacity, that constraint changes what needs confirming. An unrelated biography does not. Replace real names with Participant A or B when identity is unnecessary. For help with a document, provide the relevant passage rather than a whole private archive; follow the separate <a href="/posts/chatgpt-privacy-before-uploading/">pre-upload privacy checklist</a>.</p>
<h2>Check claims outside the answer</h2>
<p>Ask which statements came from your input, which came from a source and which are suggestions. Then open the relevant original source yourself. A link is useful only if its page supports the exact claim, is current enough for the question and covers the correct location or product.</p>
<p>For arithmetic, recompute the operation with a calculator or a small spreadsheet. For a rewrite, compare names, amounts and dates against the original. For a schedule, compare every fixed appointment. Do not ask the same assistant to confirm its own earlier statement and treat that as independent verification.</p>
<h2>Revise one failure at a time</h2>
<p>A focused follow-up for our example is: “The museum closing time was not supplied. Remove that claim, keep the confirmed 10:00 start and list opening hours as something to check.” This identifies an error and the parts that must stay unchanged. “Try harder” does not provide an observable correction target.</p>
<p>Stop when the result is fit for the small task. A more polished paragraph does not establish that an unknown price became true. If the decision has significant medical, legal or financial consequences, take it to an appropriately qualified person rather than using this beginner exercise as professional advice.</p>
<h2>Before using the draft</h2>
<ul><li>Fixed inputs match the original.</li><li>Missing information is labeled instead of guessed.</li><li>Important external claims have been checked against their sources.</li><li>The draft has not been mistaken for a completed booking, message or account change.</li><li>Private details unnecessary to the job have been removed.</li></ul>`,
      sources: [
        ['https://learn.chatgpt.com/docs/use-chatgpt', 'OpenAI: using ChatGPT and reviewing results'],
        ['https://learn.chatgpt.com/docs/prompting', 'OpenAI: prompting, context and boundaries']
      ],
      related: ['chatgpt-privacy-before-uploading', 'google-translate-check-before-sending']
    },
    'whatsapp-web-link-unlink-devices': {
      title: 'WhatsApp Web: link your computer and remove unfamiliar devices',
      description: 'Use the official WhatsApp Web address, check linked sessions on Android or iPhone, and distinguish unlinking a browser from deleting your account.',
      category: 'Web & AI · Messaging',
      lead: 'Treat linking as granting a computer access to your messaging account. Open the official site yourself, connect only a device you control and review the device list on your primary phone. Closing a browser tab is not the same as ending its linked session.',
      scope: 'Instructions concern a standard personal WhatsApp account and its web-linked session. Menu names may vary by platform or version. No account was connected or messages inspected to write this guide.',
      body: `<h2>Check the address before scanning</h2>
<p>Start at <a href="https://web.whatsapp.com/" rel="noopener noreferrer">web.whatsapp.com</a>. A search advertisement, forwarded link or familiar green icon is not proof that a page belongs to WhatsApp. Read the hostname in the address bar, not just the page heading.</p>
<p>For example, <code>web.whatsapp.com.example.invalid</code> is an illustrative fake structure, not a WhatsApp hostname and not a site to visit. A word in a subdomain does not make the entire address official. You can practice on a fictional string in KYD’s <a href="/tools/url-structure-check/">URL structure checker</a>; it does not visit addresses or certify them as safe.</p>
<p>Do not scan a linking QR code sent by another person as a requirement for a prize, refund or account check. The practical question is not whether a QR code looks normal; it is whether you intentionally opened it on the particular computer you are authorizing.</p>
<h2>Link with your primary phone</h2>
<ol><li>On your own computer, open the official WhatsApp Web page and keep its linking screen visible.</li><li>Open WhatsApp on the primary phone for the account you intend to use.</li><li>On Android, use the three-dot menu, then <strong>Linked devices</strong> and <strong>Link a device</strong>. On iPhone, enter WhatsApp Settings or your profile picture, then <strong>Linked devices</strong> and <strong>Link device</strong>.</li><li>Complete any identity check locally on your phone, following its prompt. Do not send your unlock code to anyone.</li><li>Use that phone to scan the QR code on your own computer’s screen.</li></ol>
<p>These paths come from WhatsApp’s <a href="https://faq.whatsapp.com/1317564962315842/?cms_platform=android" rel="noopener noreferrer">Android</a> and <a href="https://faq.whatsapp.com/1317564962315842/?cms_platform=iphone" rel="noopener noreferrer">iPhone linking instructions</a>. If your screen differs, select your platform in the official help page instead of approving an unrelated request.</p>
<h2>Review access, not only the current browser</h2>
<p>Open Linked devices again after linking. Check whether you recognize each session and which physical machine it represents. A device label can be generic; compare it with your own actions rather than assuming an unfamiliar label is automatically an intruder.</p>
<p>WhatsApp says a standard account can link up to four devices, and linked devices can work without the phone staying online. Its <a href="https://faq.whatsapp.com/378279804439436/?cms_platform=android" rel="noopener noreferrer">linked-device documentation</a> also describes inactivity disconnections. Do not wait for an automatic timeout to end access on a shared machine.</p>
<div class="table-wrap"><table><caption>KYD decision guide: what are you trying to stop?</caption><thead><tr><th>Situation</th><th>Action to check</th><th>Do not confuse it with</th></tr></thead><tbody><tr><td>You closed the web tab</td><td>Review whether the computer is still linked</td><td>A confirmed logout</td></tr><tr><td>You finished using a borrowed machine</td><td>Unlink that session from the primary phone</td><td>Deleting the account</td></tr><tr><td>A session is unfamiliar</td><td>Remove its access and investigate your own devices</td><td>Proof that all other copies are erased</td></tr><tr><td>You need old messages</td><td>Check the primary phone before troubleshooting</td><td>Assuming the web history is a complete backup</td></tr></tbody></table></div>
<h2>Remove a linked session from your phone</h2>
<p>In Linked devices on the primary phone, select the computer or browser you want to disconnect and choose <strong>Log out</strong>. WhatsApp’s <a href="https://faq.whatsapp.com/834124628020911/?cms_platform=android" rel="noopener noreferrer">unlinking help</a> also describes logout on the linked device itself. When you no longer have the computer, the primary-phone route avoids needing to reopen it.</p>
<p>Afterward, review the list again to confirm the selected session is no longer shown. This is an access check, not a forensic investigation. Unlinking cannot make someone forget a message they already read or retrieve a screenshot they saved. Do not erase your phone or delete your entire account merely to end a web session.</p>
<h2>If linking or message history looks wrong</h2>
<p>Begin with reversible checks: verify that you are in the intended phone account, update the official app and read the current provider help for the displayed error. Avoid installing a third-party “repair” extension or giving a remote helper your QR code or verification code.</p>
<p>At our source check, WhatsApp’s help warned that some linked devices might not display up to a year of chat history and advised checking the primary device. That notice does not diagnose every missing message. Check the current notice before assuming a blank web history means all originals were deleted.</p>
<h2>A borrowed-computer scenario</h2>
<p>Imagine you linked a family laptop for one evening. The next morning, closing the laptop’s browser is not your evidence of logout. Your finish line is the relevant session disappearing from the phone’s linked-device list after you remove it. If the laptop is not under your control, use your own device next time rather than relying on an assumed timeout.</p>`,
      sources: [
        ['https://faq.whatsapp.com/1317564962315842/?cms_platform=android', 'WhatsApp: link a device (Android)'],
        ['https://faq.whatsapp.com/1317564962315842/?cms_platform=iphone', 'WhatsApp: link a device (iPhone)'],
        ['https://faq.whatsapp.com/378279804439436/?cms_platform=android', 'WhatsApp: linked devices, limits and current history notice'],
        ['https://faq.whatsapp.com/834124628020911/?cms_platform=android', 'WhatsApp: unlink a device']
      ],
      related: ['youtube-watch-history-recommendations', 'chatgpt-privacy-before-uploading']
    },
    'youtube-watch-history-recommendations': {
      title: 'YouTube watch history: change recommendations without deleting your account',
      description: 'Choose between removing one watched video, pausing future history and clearing a time range. Learn what each action changes and what it does not.',
      category: 'Web & AI · Video',
      lead: 'An unwanted recommendation does not require deleting your Google Account. First decide whether you want to remove one past signal, stop recording future viewing or reduce suggestions from a channel. Those are different jobs with different controls.',
      scope: 'This guide uses YouTube’s signed-in computer help. It does not promise a particular recommendation, an instant reset or anonymous viewing. Review the account and confirmation text before deleting any history.',
      body: `<h2>Pick the smallest action that matches the problem</h2>
<p>A single repair tutorial watched for a friend and months of viewing you no longer want retained are different situations. Write down what bothers you before changing a setting: one topic, one channel, future recording or stored history. This stops a narrow annoyance becoming an unnecessary account-wide deletion.</p>
<div class="table-wrap"><table><caption>KYD decision matrix for YouTube history</caption><thead><tr><th>Your goal</th><th>Start with</th><th>Boundary</th></tr></thead><tbody><tr><td>One video influenced your feed</td><td>Remove that entry from watch history</td><td>Other account signals still exist</td></tr><tr><td>A channel repeatedly appears</td><td>Recommendation feedback on that channel</td><td>Not a universal block or unsubscribe</td></tr><tr><td>Future viewing should not enter history</td><td>Turn off history recording</td><td>Existing entries are a separate decision</td></tr><tr><td>You want an old period removed</td><td>Read the time-range deletion dialog</td><td>It may remove search history for that period too</td></tr></tbody></table></div>
<h2>Find the correct account and one specific entry</h2>
<p>In Google <a href="https://myactivity.google.com/product/youtube" rel="noopener noreferrer">My Activity for YouTube</a>, check which account is signed in before managing its history. Find the unwanted watched video and use its individual removal control. Do not choose a broad date range when the intended action is one entry.</p>
<p>According to <a href="https://support.google.com/youtube/answer/95725?hl=en" rel="noopener noreferrer">YouTube’s watch-history help</a>, removed viewing is no longer used for future recommendations. Videos watched with history off are not added to it. These are recording and recommendation effects, not a promise that every similar video disappears.</p>
<p>Save a wanted video’s title or link before removing its history entry, if you need to find it later. This is a practical preparation step, not a recovery method for deleted history. Leave unrelated records alone unless you have a separate reason to remove them.</p>
<h2>Pause future recording, or delete past history?</h2>
<p>In My Activity, the history controls let you turn recording off. Read the confirmation and check the resulting state. Turning a setting off is not the same as choosing a command to delete older activity.</p>
<p>The <a href="https://support.google.com/youtube/answer/57711?hl=en" rel="noopener noreferrer">search-history help</a> warns that bulk deletion can remove both search and watch activity for the selected period. Inspect the period and affected data before confirming. If your goal is only one watched video, return to the individual-entry route instead of accepting a broader dialog.</p>
<p><a href="https://support.google.com/youtube/answer/6342839?co=GENIE.Platform%3DDesktop&amp;hl=en" rel="noopener noreferrer">YouTube’s recommendation guidance</a> describes deleting and turning off watch history to remove Home recommendations. A sparse Home screen after that change does not by itself show an account fault. Decide whether you prefer recommendation-based discovery or direct searching; do not turn recording back on merely because someone calls the blank feed a bug.</p>
<h2>Give recommendation feedback when the topic is the problem</h2>
<p>On supported signed-in pages, open the menu beside a recommendation and choose <strong>Not interested</strong>. For recurring suggestions from a particular creator, look for <strong>Don’t recommend channel</strong>. <a href="https://support.google.com/youtube/answer/6342839?co=GENIE.Platform%3DDesktop&amp;hl=en" rel="noopener noreferrer">YouTube’s recommendation help</a> explains those controls and how feedback itself can be cleared.</p>
<p>The provider also describes other influences, including liked videos and Google Account activity. That is why removing one entry should not be advertised as a complete algorithm reset. Recommendation feedback is not the same as deleting uploaded videos, canceling a subscription or blocking all appearances of a creator.</p>
<h2>A fictional one-off research session</h2>
<p>Suppose you watch five bicycle-maintenance videos to help a friend, but normally use YouTube for language lessons. Your goal is to reduce that one-off topic, not erase the language-learning trail. Start by removing the relevant bike entries and using topic feedback where appropriate. If you choose to pause recording for another research session, make a deliberate decision afterward about whether to resume it.</p>
<p>This is a scenario for selecting controls, not a test claiming recommendations improve by a measured percentage. Do not judge success solely by the next thumbnail. Check the settings you changed and the specific records you intended to remove, then use search or your saved channels for immediate navigation.</p>
<h2>What this is not a privacy guarantee for</h2>
<p>History controls do not make the device private from everyone with physical access. They are also not a universal switch for every Google data category or advertisement setting. A shared TV or browser may be signed into a different account from the one on your phone; inspect that surface separately rather than assuming one change covered it.</p>
<p>If your aim is account security rather than recommendations, work through the <a href="/tools/account-security-check/">account-security planning checklist</a>. It cannot inspect an account for you, but it helps distinguish a settings task from a suspected-access problem.</p>`,
      sources: [
        ['https://support.google.com/youtube/answer/95725?hl=en', 'YouTube: watch-history controls and deletion effects'],
        ['https://support.google.com/youtube/answer/6342839?co=GENIE.Platform%3DDesktop&hl=en', 'YouTube: recommendation and feedback controls'],
        ['https://support.google.com/youtube/answer/57711?hl=en', 'YouTube: search-history controls and time-range deletion']
      ],
      related: ['whatsapp-web-link-unlink-devices', 'google-translate-check-before-sending']
    },
    'chatgpt-privacy-before-uploading': {
      title: 'ChatGPT privacy checklist: what to remove before uploading a file',
      description: 'Prepare a smaller, redacted input for ChatGPT. Check screenshots, identifiers, attachments, tool permissions and the output before sharing it.',
      category: 'Web & AI · Privacy',
      lead: 'The simplest privacy improvement is often to avoid sending information that the task does not need. Make a separate working copy, keep only relevant material and inspect both the input and the final output before sharing.',
      scope: 'This is KYD’s practical data-minimization checklist, not a guarantee of anonymity, a legal compliance assessment or instructions for a specific retention setting. It does not claim that deleting, archiving or disabling a feature erases every copy.',
      body: `<h2>Ask what the task actually needs</h2>
<p>To rewrite a delivery complaint, the assistant may need the problem, tone and outcome you want. It probably does not need your full payment-card number, password, identity document or the entire account history. Write the job in one sentence before collecting files.</p>
<p><a href="https://learn.chatgpt.com/docs/use-chatgpt" rel="noopener noreferrer">OpenAI’s usage documentation</a> describes providing relevant context and checking the result. The checklist here is an editorial way to apply that workflow with less unnecessary disclosure; it is not OpenAI’s own certification process.</p>
<h2>Make a separate copy and preserve the original</h2>
<p>Work on a duplicate, not your only source document. Extract a short passage or create a small table containing just the fields needed. Keep the original privately so you can verify the answer and restore omitted context yourself if genuinely necessary.</p>
<p>Removing a visible name is not the same as anonymizing a record. A rare job title, exact time, location and unusual event can identify someone together. Ask whether another reader could infer the person or organization from what remains. For employer or client material, obtain the appropriate authorization and follow the organization’s approved process rather than relying on this general guide.</p>
<div class="table-wrap"><table><caption>KYD pre-upload inspection: examples, not an automatic scanner</caption><thead><tr><th>Input</th><th>Look for</th><th>Smaller alternative</th></tr></thead><tbody><tr><td>Screenshot</td><td>Tabs, notification previews, names, email addresses, QR codes</td><td>A crop of the relevant setting with unrelated areas removed</td></tr><tr><td>Receipt or complaint</td><td>Account numbers, addresses, payment identifiers</td><td>Problem description with neutral placeholders</td></tr><tr><td>Spreadsheet</td><td>Hidden sheets, comments and unnecessary columns</td><td>A new file containing only the relevant rows and fields</td></tr><tr><td>Document</td><td>Comments, tracked edits, embedded files and confidential sections</td><td>A clean excerpt you have inspected</td></tr></tbody></table></div>
<h2>A fictional complaint, rewritten with fewer identifiers</h2>
<p>Imagine you want a polite message about a parcel that arrived two days late. Instead of uploading an order screenshot with a real address and payment details, prepare: “Write a calm message requesting an explanation for an item promised on [DATE A] and delivered on [DATE B]. Use [ORDER REFERENCE] as a placeholder. Do not add a legal claim, demand a specific refund or send the message.”</p>
<p>This original example preserves the writing problem while keeping identifiers out of the draft input. After checking the result, insert the real order reference yourself in the merchant’s official contact channel. The placeholders are not encryption, but they reduce what the assistant needs to process.</p>
<h2>Inspect the file, not just the preview</h2>
<p>A thumbnail can hide information. Open the working copy and look through all relevant pages or sheets. Check filenames and visible document properties as well as the main body. If you cannot confidently remove sensitive content from a complex file, use a short text description or fictional example instead.</p>
<p>Drawing a dark rectangle over text is not proof of permanent redaction in every format. Use the file application’s supported redaction process where needed and verify the exported copy. For material with legal, medical or security sensitivity, ask the responsible specialist to approve the workflow before uploading anything.</p>
<h2>Separate context from permission to act</h2>
<p>Supplying a message for rewriting does not mean you want it sent. Say “draft only” when that is your intention. If you enable tools or connections, inspect their separate permissions and the scope of the task; a textual request to avoid sharing is not a substitute for controlling access.</p>
<p><a href="https://learn.chatgpt.com/docs/permission-modes" rel="noopener noreferrer">OpenAI’s permission documentation</a> concerns desktop and Codex local actions, not a universal setting for all web chats. It distinguishes access boundaries from action review. If you use those surfaces, keep the scope limited to the files required; do not enable broader access merely to rewrite one excerpt.</p>
<h2>Check the output before forwarding</h2>
<p>Review the answer and any generated file for details you intended to keep private. A safe-looking prompt does not prevent an output from reproducing an identifier already present in its context. Also check whether the draft adds promises, accusations or facts you did not authorize.</p>
<p>OpenAI’s <a href="https://learn.chatgpt.com/docs/artifacts-viewer" rel="noopener noreferrer">file-review guidance</a> recommends inspecting generated files and making focused revisions. In this checklist, your final gate is a review of the actual version you will share, not an earlier preview.</p>
<h2>Know when not to upload</h2>
<ul><li>You cannot determine who owns the information or whether sharing is authorized.</li><li>The material contains credentials or other secrets irrelevant to the task.</li><li>You cannot inspect every relevant part of the prepared copy.</li><li>The job can be completed with a public excerpt or fictional example instead.</li></ul>
<p>For current account-level training, history, sharing and retention choices, read the explanations shown in your account and the applicable official guidance before relying on a setting. This article does not establish those policies for every plan, organization or connected third party. If you already exposed a credential, do not paste it again into a public correction report.</p>`,
      sources: [
        ['https://learn.chatgpt.com/docs/use-chatgpt', 'OpenAI: context, verification and review'],
        ['https://learn.chatgpt.com/docs/permission-modes', 'OpenAI: desktop and Codex permission boundaries'],
        ['https://learn.chatgpt.com/docs/artifacts-viewer', 'OpenAI: reviewing generated files']
      ],
      related: ['chatgpt-beginners-verify-answers', 'whatsapp-web-link-unlink-devices']
    },
    'google-translate-check-before-sending': {
      title: 'Google Translate: check names, numbers and meaning before sending',
      description: 'Use Google Translate with context, preserve dates and quantities, check ambiguous wording and understand when a human reviewer is needed.',
      category: 'Web & AI · Translation',
      lead: 'A fluent-looking translation can still change the detail that matters. Before sending it, check the language pair, names, quantities, dates, negation and the action you are asking the recipient to take.',
      scope: 'The broad search query “translate” is not exclusive to Google Translate. This guide uses Google’s service as a worked example. The review examples are KYD exercises, not measured translation outputs or a promise of accuracy in every language.',
      body: `<h2>Set the language pair before reviewing the result</h2>
<p>On a computer, open <a href="https://translate.google.com/" rel="noopener noreferrer">Google Translate</a>. Choose the source and destination languages, or use language detection for the source when needed. Confirm that detection makes sense for your text; a short name or mixed-language phrase gives little context.</p>
<p>Google’s <a href="https://support.google.com/translate/answer/6142478?co=GENIE.Platform%3DDesktop&amp;hl=en" rel="noopener noreferrer">written-text help</a> recommends putting an ambiguous word in a phrase or sentence. Definitions and alternate translations are available for some language pairs, not every result. For longer pasted text, its stated limit is 5,000 characters at a time.</p>
<h2>Clarify the source before translating</h2>
<p>“Can you change it next Friday?” leaves both “it” and the date unclear. Rewrite it as “Can you move the delivery of order [REFERENCE] to Friday, 16 October 2026?” before translating, if that is the actual intended request. The date is a fictional example here; replace it with your confirmed date.</p>
<p>Do not expect a translation service to resolve a missing subject or a date you have not defined. A clearer source reduces the number of interpretations the reviewer must examine. Keep context near an ambiguous word rather than sending a detached single word and hoping its first result fits.</p>
<h2>A worked review: a booking-change message</h2>
<p>Use this fictional source: “Please move our booking for two adults from 16 October 2026 to 17 October 2026. Keep the 19:30 start time. Do not cancel the booking.” Before translating, extract a small set of facts that the destination text must preserve.</p>
<div class="table-wrap"><table><caption>KYD meaning-preservation checklist for the fictional message</caption><thead><tr><th>Element</th><th>Required meaning</th><th>Error to watch for</th></tr></thead><tbody><tr><td>People</td><td>Two adults</td><td>Two rooms, children or an unspecified group</td></tr><tr><td>Old date</td><td>16 October 2026</td><td>Confusing it with the requested date</td></tr><tr><td>New date</td><td>17 October 2026</td><td>Missing the year or reversing the move</td></tr><tr><td>Time</td><td>19:30 stays unchanged</td><td>Changing the start or omitting the instruction</td></tr><tr><td>Negation</td><td>Do not cancel</td><td>A cancellation request</td></tr></tbody></table></div>
<p>This checklist does not assess a language you cannot read. It identifies the particular questions to ask a competent bilingual reviewer. For an important booking, request a confirmation from the recipient showing the final date, time and number of people instead of treating a fluent translation as confirmation.</p>
<h2>Names, amounts and dates need separate checks</h2>
<p>Copy official names from the relevant original record where appropriate; do not casually replace a passport spelling or account-holder name with a translated equivalent. Use placeholders when drafting and insert the verified identifiers in the final private message.</p>
<p>A date such as 04/05/2026 can have two common interpretations. Prefer a written month when preparing an international message. Keep currency and units attached to quantities. A number preserved without its unit can still describe a different order.</p>
<p>Reverse-translating the result can reveal suspicious changes, but it is not independent proof of correctness. A similar ambiguity can survive in both directions. Treat it as one check, then seek a competent reader when misunderstanding has meaningful consequences.</p>
<h2>Text, documents and scanned images are different inputs</h2>
<p>Google’s <a href="https://support.google.com/translate/answer/2534559?co=GENIE.Platform%3DDesktop&amp;hl=en" rel="noopener noreferrer">document help</a> lists supported formats, a 10 MB limit and a 300-page limit for PDFs. It says text in images or scanned PDF pages can remain in the output without being translated; document translation is not available on smaller screens or mobile.</p>
<p>A translated file therefore needs a page-by-page inspection, not just a successful download. Look for captions, footnotes, image labels and important amounts that remain unchanged or become detached from their labels. If a receipt is an image, the text-document workflow alone does not establish that its contents were interpreted.</p>
<h2>Protect the input and match the stakes</h2>
<p>Before pasting, remove private details the task does not require. Draft with [NAME] and [REFERENCE] where possible. Do not publish a confidential original in an open forum merely to obtain a translation check.</p>
<p>For a casual message, a concise source, the fact checklist and recipient clarification may be adequate. For medical instructions, contracts, immigration documents or other high-consequence material, use an appropriately qualified translator or professional. This general guide does not determine whether a certified translation is legally required.</p>
<h2>Final send check</h2>
<ol><li>Destination language is correct.</li><li>Names, dates, quantities and units match the confirmed source.</li><li>The request and any “do not” instruction retain their meaning.</li><li>Ambiguities have been resolved with a competent reader or the recipient.</li><li>You are sending the reviewed version, not an earlier draft.</li></ol>`,
      sources: [
        ['https://support.google.com/translate/answer/6142478?co=GENIE.Platform%3DDesktop&hl=en', 'Google Translate: written text, context and character limit'],
        ['https://support.google.com/translate/answer/2534559?co=GENIE.Platform%3DDesktop&hl=en', 'Google Translate: document formats, limits and scanned-text caveats']
      ],
      related: ['chatgpt-beginners-verify-answers', 'chatgpt-privacy-before-uploading']
    }
  }
};
