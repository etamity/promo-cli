# promo cli #

### 1. modify the config ###

before useing this tool, you have to modify the config accordingly.

./configs/config.js

```
'use strict';

module.exports = {
    CLIENT_CONTENT_PATH : '/Users/joey.etamity/Documents/gamesys-previews/',
    PROMOTIONS_SOURCE_PATH : '/Users/joey.etamity/Documents/gamesys-design/promotions/',
    PROMOTION_FOLDER: 'promotions',
    OFFER_FOLDER: 'offer'
}

```

### 2. link you tool

```
npm link
```

### 3. use it for deployment your promo
```
promo deploy <comment>  // e.g. "XXX promo" or "Updated Copy"
```

Please don't not contain ticket number, it will ask your to fill that infomation later.

```
prompt: plase input jira ticket id::  MDD-XXXX
prompt: is it vip (default n)? (y/n):  y  
prompt: please input the client path::  aug17-jins-jungle-fortune
```

### 4. Development & Production Build

```
promo watch 
```

Will open promo server with browser

```
promo build dev 
```

```
promo build prod 
```

### 5. Starting from a new template

```
promo new <folder> 
```

Will pull from latest template from git

### 6. Test Instructions Generator 

```
promo info
```


There you go!
