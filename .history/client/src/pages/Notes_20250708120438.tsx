

const Notes = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setBreadcrumb("To-do List"))
  }, [dispatch])

  return (
    <div>Notes</div>
  )
}

export default Notes