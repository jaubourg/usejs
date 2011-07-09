var count = 0;

expose({
	getCount: function() {
		return count++;
	}
});
