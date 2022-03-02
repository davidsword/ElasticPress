/**
 * WordPress dependencies.
 */
import { useCallback, useContext, useMemo, WPElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { facets, postTypeLabels } from '../../config';
import Context from '../../context';
import Panel from '../common/panel';
import CheckboxList from '../common/checkbox-list';
import { ActiveContraint } from '../tools/active-constraints';

/**
 * Taxonomy filter component.
 *
 * @param {Object}  props               Components props.
 * @param {boolean} props.defaultIsOpen Whether the panel is open by default.
 * @param {string}  props.label         Facet label.
 * @param {string}  props.name          Facet name.
 * @param {Array}   props.postTypes     Facet post types.
 * @return {WPElement} Component element.
 */
export default ({ defaultIsOpen, label, postTypes, name }) => {
	const {
		state: {
			isLoading,
			args: { [name]: selectedTerms = [] },
			aggregations: { [name]: { [name]: { buckets = [] } = {} } = {} } = {},
		},
		dispatch,
	} = useContext(Context);

	/**
	 * A unique label for the facet. Adds additional context to the label if
	 * another facet with the same label is being used.
	 */
	const uniqueLabel = useMemo(() => {
		const isNotUnique = facets.some((facet) => facet.label === label && facet.name !== name);
		const typeLabels = postTypes.map((postType) => postTypeLabels[postType].plural);
		const typeSeparator = __(', ', 'elasticpress');

		return isNotUnique
			? sprintf(
					/* translators: %1$s: Facet label. $2$s: Facet post types. */
					__('%1$s (%2$s)', 'elasticpress'),
					label,
					typeLabels.join(typeSeparator),
			  )
			: label;
	}, [label, postTypes, name]);

	/**
	 * Create list of filter options from aggregation buckets.
	 *
	 * @param {Array}  options    List of options.
	 * @param {Object} bucket     Aggregation bucket.
	 * @param {string} bucket.key Aggregation key.
	 * @return {Array} Array of options.
	 */
	const reduceOptions = useCallback(
		(options, { doc_count, key }) => {
			const { name: label, parent, term_id, term_order } = JSON.parse(key);

			options.push({
				checked: selectedTerms.includes(term_id),
				count: doc_count,
				id: `ep-search-${name}-${term_id}`,
				label,
				parent: parent.toString(),
				order: term_order,
				value: term_id.toString(),
			});

			return options;
		},
		[selectedTerms, name],
	);

	/**
	 * Reduce buckets to options.
	 */
	const options = useMemo(() => buckets.reduce(reduceOptions, []), [buckets, reduceOptions]);

	/**
	 * Reduce options to labels.
	 *
	 * @param {Object} labels     List of options.
	 * @param {Object} bucket     Aggregation bucket.
	 * @param {string} bucket.key Aggregation key.
	 * @return {Object} Options and their labels.
	 */
	const reduceLabels = useCallback((labels, { label, value }) => {
		labels[value] = label;

		return labels;
	}, []);

	/**
	 * Reduce buckets to labels.
	 */
	const labels = options.reduce(reduceLabels, {});

	/**
	 * Handle checkbox change event.
	 *
	 * @param {string[]} terms Selected terms.
	 */
	const onChange = (terms) => {
		dispatch({ type: 'APPLY_ARGS', payload: { [name]: terms } });
	};

	/**
	 * Handle clearing a term.
	 *
	 * @param {string} term Term being cleared.
	 */
	const onClear = (term) => {
		const terms = [...selectedTerms];

		terms.splice(terms.indexOf(term), 1);

		dispatch({ type: 'APPLY_ARGS', payload: { [name]: terms } });
	};

	return (
		options.length > 0 && (
			<Panel defaultIsOpen={defaultIsOpen} label={uniqueLabel}>
				{(isOpen) => (
					<>
						{isOpen && (
							<CheckboxList
								disabled={isLoading}
								label={sprintf(
									/* translators: %s: Taxonomy name. */
									__('Select %s', 'elasticpress'),
									label,
								)}
								options={options}
								onChange={onChange}
								selected={selectedTerms}
							/>
						)}

						{selectedTerms.map(
							(value) =>
								labels?.[value] && (
									<ActiveContraint
										key={value}
										label={labels[value]}
										onClick={() => onClear(value)}
									/>
								),
						)}
					</>
				)}
			</Panel>
		)
	);
};