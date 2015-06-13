# xkcd-cli

A ~~small~~ fun cli tool, that is there for you, if you quickly need an xkcd comic for a context. 

---

## Usage

```
$ xkcd correct horse
https://xkcd.com/936/

```


## Install

```
npm install -g xkcd-cli
```

## Notes

This is project for fun, it uses an indexed db in the package,
there will be updates as xkcd releases come out, or you can do it your own, see below.

## Updates

Running `crawl/index.js` will crawl and parse [explainxkcd.com](http://explainxkcd.com).
The latest indexed issue is stored in `data/xkcd-index.json`.

The crawler will parse every issue form the latest stored issue, till the one you pass in with the `--to` argument

**Example**

```
$ node crawl/index.js --to 1537
parsing xkcd wisdom: from 1400 to 1537  [====================] 100%
done!
```

The index db is text based, can be merged from pull requests, although it's quite big.

## Future plans

- parse the latest issue if there's no argument passed
- parse a given issue with `--id` argument
- add words to a given issue, to make proper context using something like `--id 1234 --words apple pie`

