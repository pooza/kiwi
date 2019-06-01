import Vue, { VNode } from 'vue';
import KwUrl from './url.vue';
import { concat, sum } from '../../prelude/array';

export default Vue.component('markdown', {
	props: {
		ast: {
			required: true
		},
	},

	render(createElement) {
		console.log(this.ast);

		const genEl = (ast) => concat(ast.map((token): VNode[] => {
			switch (token.type) {
				case 'text': {
					const text = token.value.replace(/(\r\n|\n|\r)/g, '\n');
					const x = text.split('\n')
						.map(t => t == '' ? [createElement('br')] : [createElement('span', t), createElement('br')]);
					x[x.length - 1].pop();
					return x;
				}

				case 'paragraph': {
					return [createElement('p', genEl(token.children))];
				}

				case 'thematicBreak': {
					return [createElement('br')];
				}

				case 'heading': {
					return [createElement('h' + token.depth, genEl(token.children))];
				}

				case 'strong': {
					return [createElement('strong', genEl(token.children))];
				}

				case 'delete': {
					return [createElement('del', genEl(token.children))];
				}

				case 'emphasis': {
					return (createElement as any)('i', {
						attrs: {
							style: 'font-style: oblique;'
						},
					}, genEl(token.children));
				}

				case 'list': {
					return [createElement(token.ordered ? 'ol' : 'ul', genEl(token.children))];
				}

				case 'listItem': {
					return [createElement('li', genEl(token.children))];
				}

				case 'table': {
					return [createElement('table', genEl(token.children))];
				}

				case 'tableRow': {
					return [createElement('tr', genEl(token.children))];
				}

				case 'tableCell': {
					return [createElement('td', genEl(token.children))];
				}

				case 'link': {
					return [createElement(KwUrl, {
						key: Math.random(),
						props: {
							title: token.title,
							url: token.url,
						},
					}, genEl(token.children))];
				}

				/*
				case 'blockCode': {
					return [createElement(MkCode, {
						key: Math.random(),
						props: {
							code: token.node.props.code,
							lang: token.node.props.lang,
						}
					})];
				}

				case 'inlineCode': {
					return [createElement(MkCode, {
						key: Math.random(),
						props: {
							code: token.node.props.code,
							lang: token.node.props.lang,
							inline: true
						}
					})];
				}*/

				case 'blockquote': {
					return [createElement('blockquote', genEl(token.children))];
				}

				default: {
					console.log('unknown ast type: ' + token.type, token);

					return [];
				}
			}
		}));

		// Parse ast to DOM
		return createElement('div', genEl(this.ast.children));
	}
});