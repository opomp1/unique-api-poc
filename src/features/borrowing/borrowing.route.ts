import Elysia, { t } from "elysia";


export const borrowingRoutes = new Elysia({prefix: "/borrowing", tags: ["Borrowing"]})
.get("/", () => {

    return "list of borrowing"
}, {
    response: {
        200: t.Object({
            data: t.Array(t.Any())
        }),
        500: t.Object({
            message: t.String()
        })
    }
})
.post("/", ({body}) => {
    return body
}, {
    body: t.Object({
        templateJson: t.Record(t.String(), t.String()),
        input: t.String()
    })
})
.put("/:id", ({params}) => {
    return params
}, {
    params: t.Object({
        id: t.String()
    })
})
.delete("/{id}", () => {
    return "deleted"
})