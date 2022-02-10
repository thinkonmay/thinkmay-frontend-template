module.exports = (req, res, next) => {
	res.status(500).render("error", {
		status: 500,
		stack: "An error occured"
	})
}