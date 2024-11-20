/**
 * Checks if `set1` is a subset of `set2`.
 */
export function isSubsetOf<T>(set1: Set<T>, set2: Set<T>): boolean {
	for (const item of set1) {
		if (!set2.has(item)) {
			return false;
		}
	}

	return true;
}

export function setUnion<T>(set1: Set<T>, set2: Set<T>): Set<T> {
	return new Set([...set1, ...set2]);
}

export function setDifference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
	return new Set([...set1].filter((item) => !set2.has(item)));
}
