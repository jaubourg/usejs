var count = 0;

use.expose({
	getCount: function() {
		return count++;
	}
});
