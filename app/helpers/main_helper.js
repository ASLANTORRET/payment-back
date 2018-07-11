'use strict';
const fs = require('fs');

module.exports.mfsImageHelper = (x) => {
   let icon_name = `/icons/${x.internalName}.png`;
       if (fs.existsSync(`${appRoot}/storage${icon_name}`)) {
          x.image = `${appConfig.api_url}${icon_name}`;
       } else if (appLodash.startsWith(x.internalName, 'almatv')) {
          x.image = `${appConfig.api_url}/icons/Almatvtv.png`;
       } else {
          x.image = `${appConfig.api_url}/icons/no_image_available.png`;
       }
   return x.image;
};

module.exports.somethingWrong = (lang) => {
    if (lang === 'en') return 'Something went wrong';
    else if (lang === 'kz') return 'Сұраныс сәтсіз аяқталды, қайтадан жіберіп көріңіз';
    else return 'Что-то пошло не так';
};

module.exports.lowerCaseLanguage = (req) => {
    try {
        req.language = `${req.language}`;
        req.language = req.language.toLowerCase();
        if (!req.language) req.language = 'ru';
    } catch (err) {
        loggerHelper.error(err);
    }
};

module.exports.filterLanguage = (req) => {
    req.language = req.body.language || req.query.language;
    this.lowerCaseLanguage(req);
    if (appLodash.includes(req.language, 'en') || appLodash.includes(req.language, 'us')) {
        req.language = 'en';
    } else if (appLodash.includes(req.language, 'kz') || appLodash.includes(req.language, 'kz')) {
        req.language = 'kz';
    } else {
        req.language = 'ru';
    }
};

module.exports.getLanguage = (req, res, next) => {
    this.filterLanguage(req);
    next();
};

module.exports.getLocaleLangKey = (lang, key, options) => {
    try {
        if (['en', 'ru', 'kz'].indexOf(lang) === -1) lang = 'ru';
        if (!appLocales || !appLocales[lang] || !appLocales[lang][key]) {
            loggerHelper.error({ name: 'getLocaleLangKey', message: `no lang-key such: ${lang}-${key}`, stack: '' });
            return this.somethingWrong(lang);
        }
        let return_string = appLocales[lang][key];

        Object.keys(options || {}).forEach(x => {
            if (options[x]) {
                if (x === 'key') {
                    options[x] = this.getLocaleLangKey(lang, options[x]);
                }
                return_string = return_string.replace(`@{${x}}`, options[x]);
            }
        });
        return return_string;
    } catch (err) {
        if (err) loggerHelper.error(err);
        return this.somethingWrong(lang);
    }
};

module.exports.getDictionaryCtoL = function() {
    return {
        'зг': 'zgh', 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'є': 'ie', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i',
        'ї': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh',
        'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'iu',
        'я': 'ia', 'ь': '', 'ъ': '', '\'': '', 'ко': 'co', 'во': 'wo', 'ва': 'wa'
    };
};

module.exports.getDictionaryLtoC = function() {
    return {
      'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г',
      'h': 'х', 'i': 'и', 'j': 'ј', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н',
      'o': 'о', 'p': 'п', 'q': '', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
      'v': 'в', 'w': 'в', 'x': '', 'y': 'ы', 'z': 'з', '\'': ''
    };
};


module.exports.transliterate = function(word, mode) {
   let a = {};
   if (mode === 'CtoL') a = this.getDictionaryCtoL();
   else a = this.getDictionaryLtoC();
   let new_word = '';
   for (let i = 0; i < word.length; i++) {
      let p_len = 0;
      let new_p = word[i];
      for (let p in a) {
          if (a.hasOwnProperty(p)) {
              let n_word = word.substring(i, word.length);
              if (appLodash.startsWith(n_word, p) && p.length > p_len) {
                  if (p === '') p_len = 1;
                  else p_len = p.length;
                  new_p = a[p];
              }
          }
      }
      for (let j = 1; j < p_len; j++) i++;
      new_word += new_p;
    }
    return new_word;
};

module.exports.addUniqueArraySimple = function(dest, src) {
    if (!src) return dest;
    if (!dest) dest = [];
    let main_ids = {};
    for (let i = 0; i < dest.length; i++) {
        main_ids[dest[i]] = true;
    }
    for (let i = 0; i < src.length; i++) {
        if (!main_ids[src[i]]) {
            dest.push(src[i]);
            main_ids[dest[i]] = true;
        }
    }
    return dest;
};

module.exports.addUniqueArray = function(dest, src) {
    if (!src) return dest;
    if (!dest) dest = [];
    let main_ids = {};
    for (let i = 0; i < dest.length; i++) {
        main_ids[dest[i].id] = true;
    }
    for (let i = 0; i < src.length; i++) {
        if (!main_ids[src[i].id]) {
            dest.push(src[i]);
            main_ids[dest[i].id] = true;
        }
    }
    return dest;
};

module.exports.compare_priority_date = function(a, b) {
	if (a.date < b.date)  return 1;
	if (a.date > b.date)  return -1;
	return 0;
};


module.exports.compare_priority = function(a, b) {
	if (a.priority < b.priority)  return 1;
	if (a.priority > b.priority)  return -1;
	return 0;
}

module.exports.addUniqueArrayPriority = function(dest, src, add_priority) {
    if (!src) return dest;
    if (!dest) dest = [];
    for (let i = 0; i < src.length; i++) {
        let flag = true;
        for (let j = 0; j < dest.length; j++) {
          if (src[i].name === dest[j].name) {
            flag = false;
            if (add_priority) dest[j].priority += src[i].priority;
            else if (dest[j].priority < src[i].priority) dest[j].priority = src[i].priority;
          }
        }
        if (flag) dest.push(src[i]);
    }
    return dest.sort(this.compare_priority);
};
