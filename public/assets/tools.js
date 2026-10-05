(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);

  function setText(selector, value, root = document) {
    const element = $(selector, root);
    if (element) element.textContent = value;
  }

  function showResult(element) {
    element.hidden = false;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function makeFinding(tone, title, detail) {
    const item = document.createElement('li');
    item.className = `finding finding-${tone}`;
    const heading = document.createElement('strong');
    heading.textContent = title;
    const description = document.createElement('span');
    description.textContent = detail;
    item.append(heading, description);
    return item;
  }

  function initializeUrlTool() {
    const form = $('#url-tool-form');
    if (!form) return;

    const input = $('#url-input');
    const result = $('#url-result');
    const facts = $('#url-facts');
    const findings = $('#url-findings');
    const shorteners = new Set([
      'bit.ly', 't.co', 'tinyurl.com', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
      'cutt.ly', 'vo.la', 'han.gl', 'me2.do', 'lrl.kr', 'url.kr'
    ]);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let raw = input.value.trim();
      result.hidden = true;
      facts.replaceChildren();
      findings.replaceChildren();
      setText('#url-result-summary', 'Only the address structure is checked. The tool does not visit it or query whether it is malicious.');

      if (!raw) {
        input.setCustomValidity('Enter an address to inspect.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');

      const suppliedScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
      if ((suppliedScheme && !/^https?:\/\//i.test(raw)) || /[\s\\\u0000-\u001f\u007f]/.test(raw)) {
        setText('#url-result-title', 'This address format cannot be analyzed.');
        findings.append(makeFinding('danger', 'HTTP and HTTPS web addresses only', 'App, file and script addresses, or inputs containing spaces or backslashes, are not reinterpreted as web addresses. Check the original input.'));
        showResult(result);
        return;
      }
      const normalized = suppliedScheme ? raw : `https://${raw}`;
      let parsed;
      try {
        parsed = new URL(normalized);
      } catch {
        setText('#url-result-title', 'Unable to interpret the address format.');
        findings.append(makeFinding('danger', 'Check the format', 'Check for spaces or invalid symbols and enter the complete address again.'));
        showResult(result);
        return;
      }

      const factValues = [
        ['Protocol', parsed.protocol.replace(':', '') || 'None'],
        ['Host', parsed.hostname || 'None'],
        ['Port', parsed.port || 'Default port'],
        ['Path', parsed.pathname || '/'],
        ['Query parameters', parsed.search ? `${new URLSearchParams(parsed.search).size} parameters` : 'None']
      ];
      factValues.forEach(([label, value]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const data = document.createElement('dd');
        term.textContent = label;
        data.textContent = value;
        row.append(term, data);
        facts.append(row);
      });

      let cautionCount = 0;
      const add = (tone, title, detail) => {
        findings.append(makeFinding(tone, title, detail));
        if (tone !== 'ok') cautionCount += 1;
      };

      if (!suppliedScheme) add('note', 'Protocol omitted', 'https:// was added only for parsing. Check the original link’s actual protocol.');
      if (parsed.protocol === 'https:') add('ok', 'HTTPS format', 'The connection uses an encrypted-transport format. HTTPS alone does not verify the site operator.');
      else add('danger', 'Not HTTPS', 'Do not enter login, payment or private information; find the official address independently.');

      if (parsed.username || parsed.password) add('danger', 'User information before @', 'An @ before the host can make the destination confusing. This differs from an @ inside a path or query.');
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) || /^\[[0-9a-f:]+\]$/i.test(parsed.hostname)) add('danger', 'Numeric IP address', 'An IP address appears instead of a usual service name. Do not submit information unless it is independently verified.');
      if (parsed.hostname.includes('xn--')) add('danger', 'Punycode host', 'The host encodes an internationalized domain. Verify the operator independently; lookalike names can be misleading.');
      if (shorteners.has(parsed.hostname.replace(/^www\./, ''))) add('note', 'Shortened URL', 'The final destination is hidden. Confirm the sender, browser warnings and final address before proceeding.');
      if (parsed.port && !['80', '443'].includes(parsed.port)) add('note', 'Nonstandard port', `:${parsed.port} is the specified port. Confirm its purpose with the operator if you were not expecting it.`);
      if (parsed.hostname.split('.').length >= 5) add('note', 'Many subdomain labels', 'A long hostname can obscure its relevant domain. Read the labels carefully from the right.');
      if (/%[0-9a-f]{2}/i.test(raw)) add('note', 'Encoded characters', 'Parts of the address use percent encoding. Encoding is not itself a threat, but can make inspection harder.');
      if (!parsed.pathname || parsed.pathname === '/') add('ok', 'Root path', 'No additional path is present. Inspect the host and the source of the link.');

      setText('#url-result-title', cautionCount ? `${cautionCount} additional checks are flagged.` : 'Few obvious structural flags were found.');
      setText('#url-result-summary', 'This analyzes appearance only, not maliciousness, ownership or current content. Use browser warnings and official guidance too.');
      showResult(result);
    });
  }

  function initializeFileTool() {
    const form = $('#file-tool-form');
    if (!form) return;

    const input = $('#file-name-input');
    const result = $('#file-result');
    const findings = $('#file-findings');
    const executable = new Set(['exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'jar', 'apk', 'appx', 'reg']);
    const shortcuts = new Set(['lnk', 'url', 'scf', 'website']);
    const macro = new Set(['docm', 'dotm', 'xlsm', 'xltm', 'xlam', 'pptm', 'potm', 'ppsm', 'sldm']);
    const archives = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'iso', 'img']);
    const documents = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'hwpx', 'txt', 'rtf']);
    const media = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'mp3', 'wav', 'mp4', 'mov', 'avi']);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const raw = input.value.trim();
      result.hidden = true;
      findings.replaceChildren();
      if (!raw) {
        input.setCustomValidity('Enter a filename to inspect.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');

      const baseName = raw.split(/[\\/]/).pop();
      const hasRlo = /[\u202a-\u202e\u2066-\u2069]/.test(baseName);
      const cleanName = baseName.replace(/[\u202a-\u202e\u2066-\u2069]/g, '');
      const parts = cleanName.split('.');
      const lastDot = cleanName.lastIndexOf('.');
      const extension = lastDot > 0 && lastDot < cleanName.length - 1 ? cleanName.slice(lastDot + 1).toLowerCase() : '';
      const priorExtension = parts.length >= 3 ? parts.at(-2).toLowerCase() : '';
      let cautionCount = 0;
      const add = (tone, title, detail) => {
        findings.append(makeFinding(tone, title, detail));
        if (tone !== 'ok') cautionCount += 1;
      };

      setText('#file-base-name', baseName.replace(/[\u202a-\u202e\u2066-\u2069]/g, (char) => `[U+${char.charCodeAt(0).toString(16).toUpperCase()}]`));
      setText('#file-extension', extension ? `.${extension}` : 'No extension');

      if (hasRlo) add('danger', 'Text-direction control character', 'A control character can make the filename ending appear different. Verify the source without opening the file.');
      if (/\.$/.test(baseName)) add('note', 'Trailing dot', 'Windows and transfer services may handle the ending differently. This tool does not silently remove the dot to infer another extension.');
      if (['doc', 'xls', 'ppt', 'rtf'].includes(extension)) add('note', 'Legacy Office or document format', 'A filename cannot reveal macros or embedded objects. Do not bypass security warnings just because the ending is not .docm.');
      if (!extension) add('note', 'Extension cannot be identified', 'Enable file-extension display in Windows and inspect the complete filename.');
      else if (executable.has(extension)) add('danger', 'Executable or installer format', `.${extension} can run a program or command. Verify the official source and available publisher information before opening.`);
      else if (shortcuts.has(extension)) add('danger', 'Shortcut format', `.${extension} may open a program, command or web address. Inspect the actual target even if the name resembles a document.`);
      else if (macro.has(extension)) add('danger', 'Macro-enabled document', `.${extension} may contain automation code. Do not enable macros for an unexpected file or sender.`);
      else if (archives.has(extension)) add('note', 'Archive or disk-image format', 'The contained files are not shown by the outer name. Inspect their final extensions without executing them, especially in unexpected encrypted attachments.');
      else if (documents.has(extension)) add('note', 'Document format', 'A document extension does not guarantee safety. Do not bypass browser or Office warnings.');
      else if (media.has(extension)) add('ok', 'Common media extension', 'This ending is commonly used for images, audio or video. Renaming does not convert contents; inspect the source too.');
      else add('note', 'Unclassified extension', `Check the purpose and associated app for .${extension} in official documentation.`);

      if (priorExtension && (documents.has(priorExtension) || media.has(priorExtension)) && (executable.has(extension) || shortcuts.has(extension))) {
        add('danger', 'Possible double-extension disguise', `The middle .${priorExtension} can resemble a document or media type, but the final extension is .${extension}.`);
      } else if (parts.length >= 3) {
        add('note', 'Several dots in the name', 'Several dots are not proof of danger. Inspect the last extension first; it is often used for app association.');
      }

      setText('#file-result-title', cautionCount ? `${cautionCount} caution or review items are flagged.` : 'Few strong warnings are visible in the name.');
      setText('#file-result-summary', 'Only the name was inspected, not contents, signatures or malware. Check the source and operating-system warnings before opening a file.');
      showResult(result);
    });
  }

  function initializeStorageTool() {
    const form = $('#storage-tool-form');
    if (!form) return;
    const result = $('#storage-result');
    const findings = $('#storage-findings');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const total = Number($('#storage-total').value);
      const free = Number($('#storage-free').value);
      const targetPercent = Number($('#storage-target').value);
      result.hidden = true;
      findings.replaceChildren();

      if (!Number.isFinite(total) || !Number.isFinite(free) || total <= 0 || free < 0 || free > total) {
        setText('#storage-error', 'Total capacity must be greater than zero; free capacity cannot exceed the total.');
        $('#storage-error').hidden = false;
        return;
      }
      $('#storage-error').hidden = true;

      const used = total - free;
      const currentPercent = (free / total) * 100;
      const targetFree = total * (targetPercent / 100);
      const cleanup = Math.max(0, targetFree - free);

      setText('#storage-used-value', `${used.toFixed(1)} GB`);
      setText('#storage-free-value', `${free.toFixed(1)} GB (${currentPercent.toFixed(1)}%)`);
      setText('#storage-target-value', `${targetFree.toFixed(1)} GB (${targetPercent}%)`);
      setText('#storage-cleanup-value', cleanup > 0 ? `${cleanup.toFixed(1)} GB` : 'No extra cleanup for this target');
      $('#storage-meter-fill').style.width = `${Math.min(100, Math.max(0, currentPercent))}%`;
      $('#storage-meter-fill').setAttribute('aria-valuenow', currentPercent.toFixed(1));

      if (cleanup <= 0) {
        findings.append(makeFinding('ok', 'Selected target met', 'Current free space meets the selected target. Review backups and unneeded downloads rather than deleting large files unnecessarily.'));
      } else {
        findings.append(makeFinding('note', 'Planning target', `Freeing ${cleanup.toFixed(1)} GB would reach approximately ${targetPercent}% free. Review candidates in stages, not one bulk deletion.`));
        if (cleanup < 2) findings.append(makeFinding('ok', 'Small planning gap', 'Review replaceable downloads, trash contents, offline copies and app cache first. The calculated gap does not prove those items are disposable.'));
        else if (cleanup < 10) findings.append(makeFinding('note', 'Medium planning gap', 'Inspect large videos, messenger media and unused apps by size. Verify actual photo copies and deletion scope before cleanup.'));
        else findings.append(makeFinding('danger', 'Large planning gap', 'Do not immediately delete photos or videos in bulk. Inspect independent copies and cloud behavior, then review cleanup in stages.'));
      }
      findings.append(makeFinding('note', 'Storage is not RAM', 'This calculation concerns file storage, not memory (RAM) used to run apps.'));
      setText('#storage-result-title', cleanup > 0 ? `Your selected target requires ${cleanup.toFixed(1)} GB more free space.` : 'The currently selected free-space target is met.');
      showResult(result);
    });
  }

  function initializeAccountTool() {
    const form = $('#account-tool-form');
    if (!form) return;
    const result = $('#account-result');
    const missing = $('#account-missing');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const items = [...form.querySelectorAll('input[type="checkbox"][data-weight]')];
      const score = items.reduce((sum, item) => sum + (item.checked ? Number(item.dataset.weight) : 0), 0);
      const unchecked = items.filter((item) => !item.checked);
      missing.replaceChildren();

      unchecked.forEach((item) => {
        const label = form.querySelector(`label[for="${item.id}"]`);
        const li = document.createElement('li');
        li.textContent = label ? label.dataset.action : 'Review the unchecked security item.';
        missing.append(li);
      });

      let band;
      let summary;
      if (score >= 85) {
        band = 'You marked many basic checks.';
        summary = 'A high score does not certify account safety. Revisit recent activity and recovery methods regularly.';
      } else if (score >= 60) {
        band = 'Important checks remain.';
        summary = 'Prioritize unique passwords, two-step verification and recovery methods among the remaining items.';
      } else {
        band = 'Start with the higher-priority account checks.';
        summary = 'Work gradually, starting with important email: unique passwords, two-step verification and recovery access.';
      }

      setText('#account-score', `${score} / 100`);
      setText('#account-result-title', band);
      setText('#account-result-summary', summary);
      $('#account-score-fill').style.width = `${score}%`;
      $('#account-score-fill').setAttribute('aria-valuenow', String(score));
      $('#account-complete').hidden = unchecked.length !== 0;
      $('#account-missing-wrap').hidden = unchecked.length === 0;
      showResult(result);
    });

    form.addEventListener('reset', () => {
      result.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initializeUrlTool();
    initializeFileTool();
    initializeStorageTool();
    initializeAccountTool();
    document.querySelectorAll('button[data-sample-for]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.sampleFor);
        input.value = button.dataset.sample;
        input.form.requestSubmit();
      });
    });
  });
})();
