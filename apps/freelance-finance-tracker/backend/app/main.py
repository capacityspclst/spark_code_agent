# Auth endpoints (no rate limiting)
@app.post("/auth/signup", response_model=schemas.Token)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        # If user already exists, return existing token instead of error
        existing_user = crud.get_user_by_email(db, user_in.email)
        access_token = create_access_token(existing_user.id)
        return {"access_token": access_token, "token_type": "bearer"}
    user = crud.create_user(db, user_in)
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}
