# maskingtape.css (1.1.0) ![npm](https://img.shields.io/npm/dt/maskingtape.css)

Block off where you want your styles to apply. Control the drips, er... I mean, the cascade.

This just applies a random class to all rules in a stylesheet (supports compound selectors), you can then apply that class to an element to prevent those styles leaking out to apply to other elements.

## Usage

```shell
$ npm install --save maskingtape.css
```

```html
<link rel=stylesheet href=/styles/components/widget.css>
...
<widget class="full-width">...</widtget>
...
<script>
  import {scope} from './maskingtape.css/c3s.js';
  
  const {prefix} = scope('/styles/component/widget.css');
  widgetEl.classList.add(prefix);
  // styles in widget are now scoped
</script>
```

If you want an alternate way of using this (that manages the class adding under the hood as well as other things (like dynamic DOM changes)
check out [Dynamic Style Sheets](https://github.com/crislin2046/dynamic-style-sheets)


## Notes

- Currently supports CORS sheets, via "crossorigin" HTML5 attribute.
  
