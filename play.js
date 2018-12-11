let ar = [1, 2, 3, 4, 5];

let result = ar.reduce((sum, current) => {
	console.log(sum, current);
	return sum + current;
});

console.log(result);